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


// Create Stripe Checkout Session //
const stripePaymentToDB = async (): Promise<any> => {
  // Create Stripe Checkout Session //
  try {
    // Create Stripe Checkout Session //
    const price = await stripe.prices.create({
      unit_amount: Number(10) * 100,
      currency: 'usd',
      product_data: {
        name: 'Booking Payment',
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${config.frontend_url}/payment-success`,
      cancel_url: `${config.frontend_url}/payment-failed`,
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: {
        bookingId: "68f25bae247ed432390a7606",
        amount: 10,
        paymentType: 'bookingPayment'
      },
    });

    return session.url;
  } catch (err) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create stripe checkout session');
  }
}


//create booking to db
const createBookingToDB = async (payload: {
  user: string;
  provider: string;
  services: string[];
  date: string;
  slots: {
    start: string;
    end: string;
  }[];
  amount: number;
}): Promise<any> => {

  const date = new Date(payload.date);
  const userSlots = payload.slots.map((slot) => ({
    start: new Date(slot.start),
    end: new Date(slot.end),
  }));


  // Check if the provider exists
  const provider = await ProviderModel.findOne({ _id: payload.provider });
  if (!provider) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Provider not found');
  }

  // Check if the services are valid
  const providerServices = provider.services.map((service) => service.toString());
  // console.log("Create booking - Provider Services : ", providerServices);
  // console.log("Create booking - Payload Services : ", payload.services);
  payload.services.forEach((service) => {
    if (!providerServices.includes(service)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid service found');
    }
  });

  // Check if the date is valid
  const providerSchedule = await ScheduleModel.findOne(
    {
      provider: new mongoose.Types.ObjectId(payload.provider),
      date: date,
    }
  )

  if (!providerSchedule) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid date found');
  }

  const providerSlots = providerSchedule?.available_slots.map((schedule: any) => {
    return {
      start: schedule.start,
      end: schedule.end,
    };
  }) || [];

  // ✅ Check if all userSlots exist in providerSlots
  const allExist = payload.slots.every(userSlot =>
    providerSlots.some(
      (providerSlot) =>
        new Date(providerSlot.start).getTime() === new Date(userSlot.start).getTime() &&
        new Date(providerSlot.end).getTime() === new Date(userSlot.end).getTime()
    )
  );

  if (!allExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid slot found');
  }

  const providerRemaingSlots = providerSlots.filter((providerSlot) => {
    return !payload.slots.some(
      (userSlot) =>
        new Date(providerSlot.start).getTime() === new Date(userSlot.start).getTime() &&
        new Date(providerSlot.end).getTime() === new Date(userSlot.end).getTime()
    );
  });

  providerSchedule!.available_slots = providerRemaingSlots;
  providerSchedule!.count = providerSchedule!.count + 1;

  await providerSchedule!.save();


  const newPayload = { ...payload, date, slots: userSlots, schedule: providerSchedule!._id };


  const res = await BookingModel.create(newPayload);
  // console.log(res);
  // return res;


  // const TEN_MINUTES = 2 * 60 * 1000;

  // setTimeout(() => {
  //   autoCancelBookingToDB(res._id.toString());
  // }, TEN_MINUTES);


  // Create Stripe Checkout Session //
  try {
    // Create Stripe Checkout Session //
    const price = await stripe.prices.create({
      unit_amount: Number(payload.amount) * 100,
      currency: 'usd',
      product_data: {
        name: 'Booking Payment',
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${config.frontend_url}/payment-success`,
      cancel_url: `${config.frontend_url}/payment-failed`,
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: {
        bookingId: res._id.toString(),
        amount: payload.amount,
        paymentType: 'bookingPayment'
      },
    });


    return session.url;
  } catch (err) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create stripe checkout session');
  }
};


// Accept booking to db
const acceptBookingToDB = async (id: string, userId: string): Promise<any> => {

  const booking = await BookingModel.findById(id);
  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found');
  }
  if (booking.status !== BOOKING_STATUS.PENDING) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking is not pending. So you can not accept it');
  }

  const provider = await ProviderModel.findById(booking.provider);
  if (!provider) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Provider not found');
  }

  if (userId !== provider.user.toString()) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized user to accept this booking');
  }

  const result = await ChatServices.createChatIntoDB(userId, {
    participants: [booking.user]
  });
  if (!result) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Accept Booking - Failed to create chat');
  }

  console.log(result)

  booking.status = BOOKING_STATUS.UPCOMING;
  booking.chatId = new Types.ObjectId(result._id);
  const res = await booking.save();

  return res;
}

// Accept booking to db
const completeBookingToDB = async (userId: string, providerid: string): Promise<any> => {

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking - User not found');
  }

  const provider = await ProviderModel.findOne({ user: providerid });
  if (!provider) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking - Provider not found');
  }

  const booking = await BookingModel.findOne({
    user: new Types.ObjectId(userId),
    provider: new Types.ObjectId(provider._id),
    status: BOOKING_STATUS.UPCOMING
  });
  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found');
  }

  const result = await ChatServices.deleteChatFromDB(booking.chatId.toString());
  if (!result) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Complete Booking - Failed to delete chat');
  }

  // console.log(result)

  booking.status = BOOKING_STATUS.COMPLETED;
  const res = await booking.save();

  // user.credits = user.credits + (booking.amount - (booking.amount * 0.15));
  // await user.save();
  await UserModel.findByIdAndUpdate(providerid, {
    $set: { credits: + (booking.amount - booking.amount * 0.15) }
  })

  return res;
}


// Cancel Booking to db
const cancelBookingToDB = async (id: string, userId: string): Promise<any> => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
  }

  const booking = await BookingModel.findById(id);
  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found');
  }

  if (booking.status !== BOOKING_STATUS.PENDING) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking is not pending. So you can not cancel it');
  }

  const provider = await ProviderModel.findById(booking.provider);
  if (!provider) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Provider not found');
  }

  const schedule = await ScheduleModel.findById(booking.schedule);
  if (!schedule) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Schedule not found');
  }

  schedule.available_slots.push(...booking.slots);
  schedule.count = schedule.count - 1;
  await schedule.save();

  booking.status = BOOKING_STATUS.CANCELLED;
  const res = await booking.save();


  if (user.role === USER_ROLES.USER) {
    await UserModel.findByIdAndUpdate(booking.user, {
      $inc: { credits: +(Number(booking.amount) - (Number(booking.amount) * 15 / 100)) }
    })
  } else if (user.role === USER_ROLES.PROVIDER) {
    await UserModel.findByIdAndUpdate(booking.user, {
      $inc: { credits: + Number(booking.amount) }
    })
  }

  return res;
}


// get overview from db
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


// get all bookings to db
const getBookingToDB = async (id: string): Promise<any> => {

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
    }
  ]);


  return res;
}


// get all bookings to db
const getBookingsToDB = async (id: string, query: any): Promise<any> => {
  const user = await UserModel.findById(id);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  let matchUserProvider: any = {}

  if (user.role === USER_ROLES.USER) {
    // console.log("Booking User", user);
    matchUserProvider = { user: new Types.ObjectId(id) }

  } else if (user.role === USER_ROLES.PROVIDER) {
    // console.log("Booking Provider", user);
    const provider = await ProviderModel.findOne({ user: new Types.ObjectId(id) });
    if (!provider) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Provider not found');
    }
    matchUserProvider = { provider: new Types.ObjectId(provider._id) }
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
    }
  ])


  return res;
}

export const BookingService = {
  createBookingToDB,
  getBookingsToDB,
  cancelBookingToDB,
  acceptBookingToDB,
  getBookingToDB,
  completeBookingToDB,
  stripePaymentToDB,
  getOverviewFromDB
};