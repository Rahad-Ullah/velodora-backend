import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { BookingModel } from './booking.model';
import mongoose, { Types } from 'mongoose';
import { ProviderModel } from '../provider/provider.model';
import { ScheduleModel } from '../schedule/schedule.model';
import { UserModel } from '../user/user.model';
import { USER_ROLES } from '../../../enums/user';
import { BOOKING_PAYMENT_STATUS, BOOKING_STATUS } from '../../../enums/booking';
import { ChatServices } from '../chat/chat.service';
import stripe from '../../config/stripe.config';
import config from '../../../config';
import { RevenueModel } from '../revenues/revenue.model';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { NOTIFICATION_TYPE } from '../notification/notification.constants';
import { ReviewService } from '../Review/review.service';
import { RsdCreditsTransformation } from '../../../helpers/rsdCreditsConver';
import { SystemModel } from '../system/system.model';
import { unlinkFile } from '../../../shared/unlinkFile';


// Create Stripe Test Payment
const stripePaymentToDB = async (): Promise<any> => {
  try {
    // ✅ Calculate 30-minute expiry in seconds
    const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;

    // ✅ Create price object
    const price = await stripe.prices.create({
      unit_amount: Number(50) * 100,
      currency: "usd",
      product_data: {
        name: "Booking Payment",
      },
    });

    // ✅ Build base session payload
    const sessionPayload: any = {
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${config.frontend_url}/payment-success`,
      cancel_url: `${config.frontend_url}/payment-failed`,
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: {
        amount: 10,
        paymentType: "testPayment",
      },
      expires_at: expiresAt
    };

    // ✅ Create checkout session
    const session = await stripe.checkout.sessions.create(sessionPayload);

    return session.url;
  } catch (err: any) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err?.message || "Failed to create stripe checkout session");
  }
};

//create booking to db
const createBookingToDB = async (payload: {
  user: string;
  provider: string;
  services: string[];
  date: string;
  slots: { start: string; end: string }[];
  amount: number;
  subTotal: number;
  promoCode?: string;
  weatherFee: number;
  convenienceFee: number;
  arrivalFee: number;
  discount: number;
  bookingDescription?: string;
  image?: string;
}): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  // console.log("Payment Payload:------------------------", payload);

  try {

    const date = new Date(payload.date);
    const userSlots = payload.slots.map((slot) => ({
      start: new Date(slot.start),
      end: new Date(slot.end),
    }));

    // ✅ Check provider
    const provider = await ProviderModel.findById(payload.provider).session(session);
    if (!provider) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Provider not found");
    }

    // ✅ Validate services
    const providerServices = provider.services.map((s) => s.toString());
    payload.services.forEach((service) => {
      if (!providerServices.includes(service)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid service found");
      }
    });

    // ✅ Validate date
    const providerSchedule = await ScheduleModel.findOne({
      provider: new mongoose.Types.ObjectId(payload.provider),
      date,
    }).session(session);

    if (!providerSchedule) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid date found");
    }

    const providerSlots =
      providerSchedule.available_slots.map((s: any) => ({
        start: s.start,
        end: s.end,
      })) || [];

    // ✅ Check all userSlots exist
    const allExist = payload.slots.every((userSlot) =>
      providerSlots.some(
        (p) =>
          new Date(p.start).getTime() === new Date(userSlot.start).getTime() &&
          new Date(p.end).getTime() === new Date(userSlot.end).getTime()
      )
    );

    if (!allExist) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid slot found");
    }

    // ✅ Update remaining slots
    const remainingSlots = providerSlots.filter(
      (p) =>
        !payload.slots.some(
          (u) =>
            new Date(p.start).getTime() === new Date(u.start).getTime() &&
            new Date(p.end).getTime() === new Date(u.end).getTime()
        )
    );

    providerSchedule.available_slots = remainingSlots;
    providerSchedule.count = providerSchedule.count + 1;
    await providerSchedule.save({ session });

    // ✅ Create booking
    const newPayload = { ...payload, providerId: provider?.user, date, slots: userSlots, schedule: providerSchedule._id };
    const booking = await BookingModel.create([newPayload], { session });
    const resBooking = booking[0];

    if (!resBooking) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create booking");
    }

    // ✅ Update user credits
    const user = await UserModel.findById(payload.user).session(session);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    const creditsToRsd = await RsdCreditsTransformation.creditsToRsd(user.credits!);
    const rsdToCredits = await RsdCreditsTransformation.rsdToCredits(payload.amount);

    const restCredits = user.credits! - rsdToCredits <= 0 ? 0 : user.credits! - rsdToCredits;
    await UserModel.findByIdAndUpdate(user._id, { credits: restCredits }, { session });


    await BookingModel.findByIdAndUpdate(
      resBooking._id,
      {
        useCredits: user.credits! - rsdToCredits <= 0 ? user.credits : rsdToCredits
      },
      { session }
    );


    // ✅ Handle payment with credits
    if (user.credits! - rsdToCredits >= 0) {
      await BookingModel.findByIdAndUpdate(
        resBooking._id,
        {
          paymentStatus: BOOKING_PAYMENT_STATUS.PAID,
        },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      sendNotifications({
        type: NOTIFICATION_TYPE.BOOKING_STATUS,
        title: 'You have a new booking',
        receiver: provider?.user,
        referenceId: user?._id,
      });

      return { data: null, message: "Booking created successfully (paid via credits)." };
    }

    // ✅ Create Stripe Checkout Session
    // const price = await stripe.prices.create({
    //   unit_amount: Number(payload.amount - creditsToRsd) * 100,
    //   currency: "usd",
    //   product_data: { name: "Booking Payment" },
    // });
    const paymentAmount = (payload.amount - creditsToRsd).toFixed(2);
    const price = await stripe.prices.create({
      unit_amount: Number(paymentAmount) * 100,
      currency: "usd",
      product_data: { name: "Booking Payment" },
    });

    const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;

    const sessionStripe = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${config.frontend_url}/payment-success`,
      cancel_url: `${config.frontend_url}/payment-failed`,
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: {
        bookingId: resBooking._id.toString(),
        amount: payload.amount - creditsToRsd,
        paymentType: "bookingPayment",
      },
      expires_at: expiresAt
    });

    await session.commitTransaction();
    session.endSession();

    return { data: sessionStripe.url, message: "Please pay for the booking" };
  } catch (err) {
    unlinkFile(payload.image || '');
    await session.abortTransaction();
    session.endSession();
    console.error("Transaction failed:", err);
    throw err;
  }
};

// Accept booking to db
const acceptBookingToDB = async (id: string, userId: string): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ✅ Fetch booking
    const booking = await BookingModel.findById(id).session(session);
    if (!booking) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found');
    }

    if (booking.status !== BOOKING_STATUS.PENDING) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Booking is not pending. So you can not accept it'
      );
    }

    // ✅ Fetch provider
    const provider = await ProviderModel.findById(booking.provider).session(session);
    if (!provider) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Provider not found');
    }

    // ✅ Authorization check
    if (userId !== provider.user.toString()) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized user to accept this booking');
    }

    // ✅ Create chat inside the transaction
    const result = await ChatServices.createChatIntoDB(
      userId,
      {
        participants: [booking.user.toString()],
        session,
      }
    );

    if (!result) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Accept Booking - Failed to create chat');
    }

    // ✅ Update booking
    booking.status = BOOKING_STATUS.UPCOMING;
    booking.chatId = new Types.ObjectId(result._id);
    const res = await booking.save({ session });

    // ✅ Record revenue
    const revenue = await RevenueModel.create(
      [
        {
          user: new mongoose.Types.ObjectId(booking.user),
          revenue: booking.weatherFee! + booking.convenienceFee! + booking.arrivalFee! - booking.discount!,
        },
      ],
      { session }
    );

    if (!revenue) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to cut revenue');
    }

    // ✅ Commit transaction
    await session.commitTransaction();
    session.endSession();

    sendNotifications({
      type: NOTIFICATION_TYPE.BOOKING_STATUS,
      title: 'Your Booking has been accepted',
      receiver: booking!.user,
      referenceId: booking!.providerId,
    })

    return res;
  } catch (error) {
    // ❌ Rollback all changes if any step fails
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// Accept booking to db
const completeBookingToDB = async (userId: string, providerId: string): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await UserModel.findById(userId).session(session);
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');

    const provider = await ProviderModel.findOne({ user: providerId }).session(session);
    if (!provider) throw new ApiError(StatusCodes.NOT_FOUND, 'Provider not found');

    const bookingCount = await BookingModel.countDocuments({
      user: new Types.ObjectId(userId),
      provider: new Types.ObjectId(provider._id),
      status: BOOKING_STATUS.UPCOMING,
    }).session(session);

    // 1️⃣ Aggregation to find earliest booking
    const earliest = await BookingModel.aggregate([
      {
        $match: {
          user: new Types.ObjectId(userId),
          provider: new Types.ObjectId(provider._id),
          status: BOOKING_STATUS.UPCOMING,
        }
      },
      {
        $addFields: {
          earliestSlotStart: { $min: "$slots.start" }
        }
      },
      { $sort: { earliestSlotStart: 1, date: 1 } },
      { $limit: 1 }
    ]).session(session);

    if (!earliest || earliest.length === 0)
      throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");

    // 2️⃣ Fetch the actual Mongoose document (so .save() works)
    const booking = await BookingModel.findById(earliest[0]._id).session(session);
    if (!booking) throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");

    // 3️⃣ Delete chat if needed
    if (bookingCount <= 1) {
      const result = await ChatServices.deleteChatFromDB(
        booking.chatId.toString(),
        { session }
      );
      if (!result) throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete chat');
    }

    // 4️⃣ Update booking
    booking.status = BOOKING_STATUS.COMPLETED;
    const updatedBooking = await booking.save({ session });

    // 5️⃣ Update provider credits
    await UserModel.findByIdAndUpdate(
      providerId,
      { $inc: { credits: booking.subTotal } },
      { session }
    );

    // 6️⃣ Commit transaction
    await session.commitTransaction();
    session.endSession();

    // 7️⃣ Notification after commit
    sendNotifications({
      type: NOTIFICATION_TYPE.BOOKING_STATUS,
      title: 'Booking Completed Successfully',
      receiver: booking.user,
      referenceId: booking.providerId,
    });

    return updatedBooking;

  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error('Transaction failed:', error);
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

// Cancel Booking to db
const cancelBookingToDB = async (id: string, userId: string): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await UserModel.findById(userId).session(session);
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized");
    }

    const booking: any = await BookingModel.findById(id).session(session);
    if (!booking) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
    }

    if (booking.status === BOOKING_STATUS.UPCOMING) {
      const bookingCount = await BookingModel.countDocuments({
        user: booking?.user,
        provider: booking?.providerId,
        status: BOOKING_STATUS.UPCOMING,
      }).session(session);

      // 3️⃣ Delete chat if needed
      if (bookingCount <= 1) {
        const result = await ChatServices.deleteChatFromDB(
          booking.chatId.toString(),
          { session }
        );
        if (!result) throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete chat');
      }
    }

    const provider = await ProviderModel.findById(booking.provider).session(session);
    if (!provider) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Provider not found");
    }

    const schedule = await ScheduleModel.findById(booking.schedule).session(session);
    if (!schedule) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Schedule not found");
    }

    // Restore available slots
    schedule.available_slots.push(...booking.slots);
    schedule.count = schedule.count - 1;
    await schedule.save({ session });

    // Update booking status
    booking.status = BOOKING_STATUS.CANCELLED;
    const res = await booking.save({ session });

    // If the user cancelled the booking
    if (user.role === USER_ROLES.USER) {
      const date = new Date();
      const currentTime = date.getTime();
      const smallestStart = booking.slots.reduce((min:any, current:any) => {
        return new Date(current.start) < new Date(min.start) ? current : min;
      });
      // const bookingDate = new Date(smallestStart.start);
      const bookingTime = new Date(smallestStart.start).getTime();

      const isExistSystem = await SystemModel.findOne({}).lean();
      const penaltyTime = isExistSystem?.penaltyTime || 1;

      const timeDiffInHours = (bookingTime - currentTime) / (1000 * 60 * 60);


      // console.log("Current Date:", date);
      // console.log("Original Booking Date:", smallestStart.start);
      // console.log("Booking Date:", bookingDate);
      // console.log("Current Time:", currentTime);
      // console.log("Booking Time:", bookingTime);
      // console.log("Time Difference in Hours:", timeDiffInHours);
      // console.log("Penalty Time:", penaltyTime);

      if (timeDiffInHours <= penaltyTime) {
        // Cancelled within penalty window (partial refund)
        const chargeAmount = booking.amount * 0.7;
        const revenueAmount = booking.amount * 0.3;

        await UserModel.findByIdAndUpdate(
          booking.user,
          {
            $inc: { credits: await RsdCreditsTransformation.rsdToCredits(chargeAmount) },
          },
          { session }
        );

        await RevenueModel.create(
          [
            {
              user: booking.user,
              revenue: revenueAmount,
            },
          ],
          { session }
        );
        sendNotifications({
          type: NOTIFICATION_TYPE.BOOKING_STATUS,
          title: 'Booking Completed Successfully',
          receiver: booking?.providerId,
          referenceId: booking?.user,
        });
      } else {
        // Full refund
        await UserModel.findByIdAndUpdate(
          booking.user,
          {
            $inc: { credits: await RsdCreditsTransformation.rsdToCredits(booking.amount) },
          },
          { session }
        );
        sendNotifications({
          type: NOTIFICATION_TYPE.BOOKING_STATUS,
          title: 'Booking Cancelled Successfully',
          receiver: booking?.providerId,
          referenceId: booking?.user,
        });
      }
    }

    // If provider cancels the booking
    else if (user.role === USER_ROLES.PROVIDER) {
      await UserModel.findByIdAndUpdate(
        booking.user,
        {
          $inc: { credits: await RsdCreditsTransformation.rsdToCredits(booking.amount) },
        },
        { session }
      );
      sendNotifications({
        type: NOTIFICATION_TYPE.BOOKING_STATUS,
        title: 'Booking Cancelled Successfully',
        receiver: booking?.user,
        referenceId: booking?.providerId,
      });
    }


    // ✅ Commit transaction if everything passed
    await session.commitTransaction();
    session.endSession();

    booking?.image && unlinkFile(booking?.image);

    return res;
  } catch (error) {
    // ❌ Rollback if anything failed
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// get overview from db
const getOverviewFromDB = async (
  id: string,
  filter?: { year?: number; month?: number; day?: number }
): Promise<any> => {
  const provider = await ProviderModel.findOne({ user: id });
  if (!provider) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Provider not found");
  }

  const matchConditions: any = { provider: provider._id };

  // ✅ Only add $expr if any date filter is provided
  if (filter?.year || filter?.month || filter?.day) {
    matchConditions.$expr = { $and: [] };

    if (filter.year) {
      matchConditions.$expr.$and.push({
        $eq: [{ $year: "$date" }, filter.year],
      });
    }

    if (filter.month) {
      matchConditions.$expr.$and.push({
        $eq: [{ $month: "$date" }, filter.month],
      });
    }

    if (filter.day) {
      matchConditions.$expr.$and.push({
        $eq: [{ $dayOfMonth: "$date" }, filter.day],
      });
    }

    // If only one condition exists, $and is not required
    if (matchConditions.$expr.$and.length === 1) {
      matchConditions.$expr = matchConditions.$expr.$and[0];
    }
  }

  const overview = await BookingModel.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: null,
        totalCompleted: {
          $sum: {
            $cond: [{ $eq: ["$status", "Completed"] }, 1, 0],
          },
        },
        totalCanceled: {
          $sum: {
            $cond: [
              { $in: ["$status", ["Cancelled", "Auto_Cancelled"]] },
              1,
              0,
            ],
          },
        },
        totalEarned: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$paymentStatus", "Paid"] },
                  { $eq: ["$status", "Completed"] },
                ],
              },
              "$amount",
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalCompleted: 1,
        totalCanceled: 1,
        totalEarned: 1,
      },
    },
  ]);

  return overview[0] || {
    totalCompleted: 0,
    totalCanceled: 0,
    totalEarned: 0,
  };
};

// get booking details to db
const getBookingToDB = async (id: string): Promise<any> => {
  const booking: any = await BookingModel.findById(id);
  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found');
  }

  const provider: any = await ProviderModel.findById(booking?.provider?.toString());

  const ratings: any = await ReviewService.getMyRatingsToDB(provider?.user?.toString());

  const res = await BookingModel.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: 'services',
        localField: 'services',
        foreignField: '_id',
        as: 'services',
        pipeline: [
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category',
              pipeline: [
                {
                  $project: {
                    name: 1,
                  }
                },
                {
                  $unwind: {
                    path: '$name',
                    preserveNullAndEmptyArrays: true,
                  }
                }

              ]
            },
          },
          {
            $unwind: {
              path: '$category',
              preserveNullAndEmptyArrays: true,
            }
          },
          {
            $project: {
              name: 1,
              category: 1,
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
        pipeline: [
          {
            $project: {
              name: 1,
              image: 1,
              location: 1,
              email: 1,
              countryCode: 1,
              contact: 1,
            }
          }
        ]
      }
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $lookup: {
        from: 'providers',
        localField: 'provider',
        foreignField: '_id',
        as: 'provider',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user',
              pipeline: [
                {
                  $project: {
                    name: 1,
                    image: 1,
                    email: 1,
                    countryCode: 1,
                    contact: 1,
                    location: 1,
                  }
                }
              ]
            },

          },
          {
            $unwind: {
              path: '$user',
              preserveNullAndEmptyArrays: true,
            }
          },
          {
            $addFields: {
              "name": "$user.name",
              "image": "$user.image",
              "email": "$user.email",
              "countryCode": "$user.countryCode",
              "contact": "$user.contact",
              "primaryLocation": "$user.location",
            }
          },
          {
            $project: {
              name: 1,
              image: 1,
              email: 1,
              countryCode: 1,
              contact: 1,
              primaryLocation: 1,
            }
          }
        ]
      }
    },
    {
      $unwind: {
        path: '$provider',
        preserveNullAndEmptyArrays: true,
      }
    }
  ]);

  // return res
  return [{ ...res[0], ratings: ratings.data }];
}

// get all bookings to db
const getBookingsToDB = async (id: string, query: any): Promise<any> => {
  const page = query.page ? parseInt(query.page as string, 10) : 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  // const currentHour = new Date().getHours();
  // const prevHour = new Date().setHours(currentHour - hours);
  const user = await UserModel.findById(id);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  let matchUserProvider: any = {}

  if (user.role === USER_ROLES.USER) {
    matchUserProvider = { user: new Types.ObjectId(id) }

  } else if (user.role === USER_ROLES.PROVIDER) {
    const provider = await ProviderModel.findOne({ user: new Types.ObjectId(id) });
    if (!provider) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Provider not found');
    }
    matchUserProvider = { provider: new Types.ObjectId(provider._id) }
  } else {
    matchUserProvider = {}
  }

  if (query.date) {
    matchUserProvider.date = new Date(query.date);
  }
  if (query.status) {
    matchUserProvider.status = query.status;
  }


  const res = await BookingModel.aggregate([
    {
      $match: matchUserProvider
    },
    {
      $lookup: {
        from: 'services',
        localField: 'services',
        foreignField: '_id',
        as: 'services',
        pipeline: [
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category',
              pipeline: [
                {
                  $project: {
                    name: 1,
                    icon: 1
                  }
                },
                {
                  $unwind: {
                    path: '$name',
                    preserveNullAndEmptyArrays: true,
                  }
                }

              ]
            },
          },
          {
            $unwind: {
              path: '$category',
              preserveNullAndEmptyArrays: true,
            }
          },
          {
            $project: {
              name: 1,
              category: 1,
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
        pipeline: [
          {
            $project: {
              name: 1,
              image: 1,
              location: 1,
            }
          }
        ]
      }
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $lookup: {
        from: 'providers',
        localField: 'provider',
        foreignField: '_id',
        as: 'provider',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user',
              pipeline: [
                {
                  $project: {
                    name: 1,
                    image: 1,
                  }
                }
              ]
            },

          },
          {
            $unwind: {
              path: '$user',
              preserveNullAndEmptyArrays: true,
            }
          },
          {
            $addFields: {
              "name": "$user.name",
              "image": "$user.image",
            }
          },
          {
            $project: {
              name: 1,
              image: 1,
              primaryLocation: 1,
            }
          }
        ]
      }
    },
    {
      $unwind: {
        path: '$provider',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $facet: {
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
        ],
        totalCount: [
          { $count: "count" }
        ]
      }
    }
  ])

  const resData = res[0]?.data;
  const totalCount = res[0].totalCount[0] ? res[0].totalCount[0].count : 0;

  const meta = {
    page: page,
    limit: limit,
    total: totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };


  return { data: resData, meta: meta };
}

// get all bookings for admin dashboard to db
const getBookingsForAdminFromDB = async (id: string, query: any): Promise<any> => {
  const page = query.page ? parseInt(query.page as string, 10) : 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  // const currentHour = new Date().getHours();
  // const prevHour = new Date().setHours(currentHour - hours);

  const user = await UserModel.findById(id);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  let matchUserProvider: any = {}

  if (user.role === USER_ROLES.USER) {
    matchUserProvider = { user: new Types.ObjectId(id) }

  } else if (user.role === USER_ROLES.PROVIDER) {
    const provider = await ProviderModel.findOne({ user: new Types.ObjectId(id) });
    if (!provider) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Provider not found');
    }
    matchUserProvider = { provider: new Types.ObjectId(provider._id) }
  } else {
    matchUserProvider = {}
  }

  if (query.date) {
    matchUserProvider.date = new Date(query.date);
  }
  if (query.status) {
    matchUserProvider.status = query.status;
  }

  const pipeline: any = [];

  if (query.hours) {
    const now = new Date();
    const prevHour = new Date(now.getTime() - query.hours * 60 * 60 * 1000);

    pipeline.push({
      $match: {
        slots: {
          $elemMatch: {
            start: {
              $gte: prevHour,
              $lte: now,
            },
          },
        },
      },
    });
  }



  pipeline.push(
    {
      $match: matchUserProvider
    }
  )

  pipeline.push(
    {
      $lookup: {
        from: 'services',
        localField: 'services',
        foreignField: '_id',
        as: 'services',
        pipeline: [
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category',
              pipeline: [
                {
                  $project: {
                    name: 1,
                    icon: 1
                  }
                },
                {
                  $unwind: {
                    path: '$name',
                    preserveNullAndEmptyArrays: true,
                  }
                }

              ]
            },
          },
          {
            $unwind: {
              path: '$category',
              preserveNullAndEmptyArrays: true,
            }
          },
          {
            $project: {
              name: 1,
              category: 1,
            }
          }
        ]
      }
    }
  )

  pipeline.push(
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
        pipeline: [
          {
            $project: {
              name: 1,
              image: 1,
              location: 1,
              email: 1,
              countryCode: 1,
              contact: 1,
            }
          }
        ]
      }
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $lookup: {
        from: 'providers',
        localField: 'provider',
        foreignField: '_id',
        as: 'provider',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user',
              pipeline: [
                {
                  $project: {
                    name: 1,
                    image: 1,
                    email: 1,
                    countryCode: 1,
                    contact: 1,
                    location: 1
                  }
                }
              ]
            },

          },
          {
            $unwind: {
              path: '$user',
              preserveNullAndEmptyArrays: true,
            }
          },
          {
            $addFields: {
              "name": "$user.name",
              "image": "$user.image",
              "email": "$user.email",
              "countryCode": "$user.countryCode",
              "contact": "$user.contact",
              "location": "$user.location"
            }
          },
          {
            $project: {
              name: 1,
              image: 1,
              email: 1,
              countryCode: 1,
              contact: 1,
              location: 1
            }
          }
        ]
      }
    },
    {
      $unwind: {
        path: '$provider',
        preserveNullAndEmptyArrays: true,
      }
    }
  )

  pipeline.push({
    $facet: {
      data: [
        { $skip: skip },
        { $limit: limit }
      ],
      totalCount: [
        { $count: "count" }
      ]
    }
  });



  const res = await BookingModel.aggregate(pipeline);

  const resData = res[0].data;
  const totalCount = res[0].totalCount[0] ? res[0].totalCount[0].count : 0;

  const meta = {
    page: page,
    limit: limit,
    total: totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };


  return { data: resData, meta: meta };
}

// get all bookings for admin dashboard to db
const getBookingsDownloadDB = async (id: string, query: any): Promise<any> => {

  let matchUserProvider: any = {}

  if (query.status) {
    matchUserProvider.status = query.status;
  }

  const pipeline: any = [];



  pipeline.push(
    {
      $match: matchUserProvider
    }
  )

  pipeline.push(
    {
      $lookup: {
        from: 'services',
        localField: 'services',
        foreignField: '_id',
        as: 'services',
        pipeline: [
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category',
              pipeline: [
                {
                  $project: {
                    name: 1,
                    icon: 1
                  }
                },
                {
                  $unwind: {
                    path: '$name',
                    preserveNullAndEmptyArrays: true,
                  }
                }

              ]
            },
          },
          {
            $unwind: {
              path: '$category',
              preserveNullAndEmptyArrays: true,
            }
          },
          {
            $project: {
              name: 1,
              category: 1,
            }
          }
        ]
      }
    }
  )

  pipeline.push(
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
        pipeline: [
          {
            $project: {
              name: 1,
              image: 1,
              location: 1,
              email: 1,
              countryCode: 1,
              contact: 1,
            }
          }
        ]
      }
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $lookup: {
        from: 'providers',
        localField: 'provider',
        foreignField: '_id',
        as: 'provider',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user',
              pipeline: [
                {
                  $project: {
                    name: 1,
                    image: 1,
                    email: 1,
                    countryCode: 1,
                    contact: 1,
                    location: 1
                  }
                }
              ]
            },

          },
          {
            $unwind: {
              path: '$user',
              preserveNullAndEmptyArrays: true,
            }
          },
          {
            $addFields: {
              "name": "$user.name",
              "image": "$user.image",
              "email": "$user.email",
              "countryCode": "$user.countryCode",
              "contact": "$user.contact",
              "location": "$user.location"
            }
          },
          {
            $project: {
              name: 1,
              image: 1,
              email: 1,
              countryCode: 1,
              contact: 1,
              location: 1
            }
          }
        ]
      }
    },
    {
      $unwind: {
        path: '$provider',
        preserveNullAndEmptyArrays: true,
      }
    }
  )

  const res = await BookingModel.aggregate(pipeline);


  return { data: res ?? [] };
}



export const BookingService = {
  createBookingToDB,
  getBookingsToDB,
  cancelBookingToDB,
  acceptBookingToDB,
  getBookingToDB,
  completeBookingToDB,
  stripePaymentToDB,
  getOverviewFromDB,
  getBookingsForAdminFromDB,
  getBookingsDownloadDB
};