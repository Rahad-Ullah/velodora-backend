"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const booking_model_1 = require("./booking.model");
const mongoose_1 = __importStar(require("mongoose"));
const provider_model_1 = require("../provider/provider.model");
const schedule_model_1 = require("../schedule/schedule.model");
const user_model_1 = require("../user/user.model");
const user_1 = require("../../../enums/user");
const booking_1 = require("../../../enums/booking");
const chat_service_1 = require("../chat/chat.service");
const stripe_config_1 = __importDefault(require("../../config/stripe.config"));
const config_1 = __importDefault(require("../../../config"));
const revenue_model_1 = require("../revenues/revenue.model");
const notificationHelper_1 = require("../../../helpers/notificationHelper");
const notification_constants_1 = require("../notification/notification.constants");
const review_service_1 = require("../Review/review.service");
const rsdCreditsConver_1 = require("../../../helpers/rsdCreditsConver");
const system_model_1 = require("../system/system.model");
// Create Stripe Test Payment
const stripePaymentToDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // ✅ Calculate 30-minute expiry in seconds
        const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;
        // ✅ Create price object
        const price = yield stripe_config_1.default.prices.create({
            unit_amount: Number(50) * 100,
            currency: "usd",
            product_data: {
                name: "Booking Payment",
            },
        });
        // ✅ Build base session payload
        const sessionPayload = {
            payment_method_types: ["card"],
            mode: "payment",
            success_url: `${config_1.default.frontend_url}/payment-success`,
            cancel_url: `${config_1.default.frontend_url}/payment-failed`,
            line_items: [{ price: price.id, quantity: 1 }],
            metadata: {
                amount: 10,
                paymentType: "testPayment",
            },
            expires_at: expiresAt
        };
        // ✅ Create checkout session
        const session = yield stripe_config_1.default.checkout.sessions.create(sessionPayload);
        return session.url;
    }
    catch (err) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, (err === null || err === void 0 ? void 0 : err.message) || "Failed to create stripe checkout session");
    }
});
//create booking to db
const createBookingToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    console.log("Payment Payload:------------------------", payload);
    try {
        const date = new Date(payload.date);
        const userSlots = payload.slots.map((slot) => ({
            start: new Date(slot.start),
            end: new Date(slot.end),
        }));
        // ✅ Check provider
        const provider = yield provider_model_1.ProviderModel.findById(payload.provider).session(session);
        if (!provider) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Provider not found");
        }
        // ✅ Validate services
        const providerServices = provider.services.map((s) => s.toString());
        payload.services.forEach((service) => {
            if (!providerServices.includes(service)) {
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Invalid service found");
            }
        });
        // ✅ Validate date
        const providerSchedule = yield schedule_model_1.ScheduleModel.findOne({
            provider: new mongoose_1.default.Types.ObjectId(payload.provider),
            date,
        }).session(session);
        if (!providerSchedule) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Invalid date found");
        }
        const providerSlots = providerSchedule.available_slots.map((s) => ({
            start: s.start,
            end: s.end,
        })) || [];
        // ✅ Check all userSlots exist
        const allExist = payload.slots.every((userSlot) => providerSlots.some((p) => new Date(p.start).getTime() === new Date(userSlot.start).getTime() &&
            new Date(p.end).getTime() === new Date(userSlot.end).getTime()));
        if (!allExist) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Invalid slot found");
        }
        // ✅ Update remaining slots
        const remainingSlots = providerSlots.filter((p) => !payload.slots.some((u) => new Date(p.start).getTime() === new Date(u.start).getTime() &&
            new Date(p.end).getTime() === new Date(u.end).getTime()));
        providerSchedule.available_slots = remainingSlots;
        providerSchedule.count = providerSchedule.count + 1;
        yield providerSchedule.save({ session });
        // ✅ Create booking
        const newPayload = Object.assign(Object.assign({}, payload), { providerId: provider === null || provider === void 0 ? void 0 : provider.user, date, slots: userSlots, schedule: providerSchedule._id });
        const booking = yield booking_model_1.BookingModel.create([newPayload], { session });
        const resBooking = booking[0];
        if (!resBooking) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create booking");
        }
        // ✅ Update user credits
        const user = yield user_model_1.UserModel.findById(payload.user).session(session);
        if (!user) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "User not found");
        }
        const creditsToRsd = yield rsdCreditsConver_1.RsdCreditsTransformation.creditsToRsd(user.credits);
        const rsdToCredits = yield rsdCreditsConver_1.RsdCreditsTransformation.rsdToCredits(payload.amount);
        const restCredits = user.credits - rsdToCredits <= 0 ? 0 : user.credits - rsdToCredits;
        yield user_model_1.UserModel.findByIdAndUpdate(user._id, { credits: restCredits }, { session });
        yield booking_model_1.BookingModel.findByIdAndUpdate(resBooking._id, {
            useCredits: user.credits - rsdToCredits <= 0 ? user.credits : rsdToCredits
        }, { session });
        // ✅ Handle payment with credits
        if (user.credits - rsdToCredits >= 0) {
            yield booking_model_1.BookingModel.findByIdAndUpdate(resBooking._id, {
                paymentStatus: booking_1.BOOKING_PAYMENT_STATUS.PAID,
            }, { session });
            yield session.commitTransaction();
            session.endSession();
            (0, notificationHelper_1.sendNotifications)({
                type: notification_constants_1.NOTIFICATION_TYPE.BOOKING_STATUS,
                title: 'You have a new booking',
                receiver: provider === null || provider === void 0 ? void 0 : provider.user,
                referenceId: user === null || user === void 0 ? void 0 : user._id,
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
        const price = yield stripe_config_1.default.prices.create({
            unit_amount: Number(paymentAmount) * 100,
            currency: "usd",
            product_data: { name: "Booking Payment" },
        });
        const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;
        const sessionStripe = yield stripe_config_1.default.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            success_url: `${config_1.default.frontend_url}/payment-success`,
            cancel_url: `${config_1.default.frontend_url}/payment-failed`,
            line_items: [{ price: price.id, quantity: 1 }],
            metadata: {
                bookingId: resBooking._id.toString(),
                amount: payload.amount - creditsToRsd,
                paymentType: "bookingPayment",
            },
            expires_at: expiresAt
        });
        yield session.commitTransaction();
        session.endSession();
        return { data: sessionStripe.url, message: "Please pay for the booking" };
    }
    catch (err) {
        yield session.abortTransaction();
        session.endSession();
        console.error("Transaction failed:", err);
        throw err;
    }
});
// Accept booking to db
const acceptBookingToDB = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // ✅ Fetch booking
        const booking = yield booking_model_1.BookingModel.findById(id).session(session);
        if (!booking) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Booking not found');
        }
        if (booking.status !== booking_1.BOOKING_STATUS.PENDING) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Booking is not pending. So you can not accept it');
        }
        // ✅ Fetch provider
        const provider = yield provider_model_1.ProviderModel.findById(booking.provider).session(session);
        if (!provider) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Provider not found');
        }
        // ✅ Authorization check
        if (userId !== provider.user.toString()) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'You are not authorized user to accept this booking');
        }
        // ✅ Create chat inside the transaction
        const result = yield chat_service_1.ChatServices.createChatIntoDB(userId, {
            participants: [booking.user.toString()],
            session,
        });
        if (!result) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Accept Booking - Failed to create chat');
        }
        // ✅ Update booking
        booking.status = booking_1.BOOKING_STATUS.UPCOMING;
        booking.chatId = new mongoose_1.Types.ObjectId(result._id);
        const res = yield booking.save({ session });
        // ✅ Record revenue
        const revenue = yield revenue_model_1.RevenueModel.create([
            {
                user: new mongoose_1.default.Types.ObjectId(booking.user),
                revenue: booking.weatherFee + booking.convenienceFee + booking.arrivalFee - booking.discount,
            },
        ], { session });
        if (!revenue) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to cut revenue');
        }
        // ✅ Commit transaction
        yield session.commitTransaction();
        session.endSession();
        (0, notificationHelper_1.sendNotifications)({
            type: notification_constants_1.NOTIFICATION_TYPE.BOOKING_STATUS,
            title: 'Your Booking has been accepted',
            receiver: booking.user,
            referenceId: booking.providerId,
        });
        return res;
    }
    catch (error) {
        // ❌ Rollback all changes if any step fails
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
// Accept booking to db
const completeBookingToDB = (userId, providerId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const user = yield user_model_1.UserModel.findById(userId).session(session);
        if (!user)
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found');
        const provider = yield provider_model_1.ProviderModel.findOne({ user: providerId }).session(session);
        if (!provider)
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Provider not found');
        const bookingCount = yield booking_model_1.BookingModel.countDocuments({
            user: new mongoose_1.Types.ObjectId(userId),
            provider: new mongoose_1.Types.ObjectId(provider._id),
            status: booking_1.BOOKING_STATUS.UPCOMING,
        }).session(session);
        // 1️⃣ Aggregation to find earliest booking
        const earliest = yield booking_model_1.BookingModel.aggregate([
            {
                $match: {
                    user: new mongoose_1.Types.ObjectId(userId),
                    provider: new mongoose_1.Types.ObjectId(provider._id),
                    status: booking_1.BOOKING_STATUS.UPCOMING,
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
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Booking not found");
        // 2️⃣ Fetch the actual Mongoose document (so .save() works)
        const booking = yield booking_model_1.BookingModel.findById(earliest[0]._id).session(session);
        if (!booking)
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Booking not found");
        // 3️⃣ Delete chat if needed
        if (bookingCount <= 1) {
            const result = yield chat_service_1.ChatServices.deleteChatFromDB(booking.chatId.toString(), { session });
            if (!result)
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete chat');
        }
        // 4️⃣ Update booking
        booking.status = booking_1.BOOKING_STATUS.COMPLETED;
        const updatedBooking = yield booking.save({ session });
        // 5️⃣ Update provider credits
        yield user_model_1.UserModel.findByIdAndUpdate(providerId, { $inc: { credits: booking.subTotal } }, { session });
        // 6️⃣ Commit transaction
        yield session.commitTransaction();
        session.endSession();
        // 7️⃣ Notification after commit
        (0, notificationHelper_1.sendNotifications)({
            type: notification_constants_1.NOTIFICATION_TYPE.BOOKING_STATUS,
            title: 'Booking Completed Successfully',
            receiver: booking.user,
            referenceId: booking.providerId,
        });
        return updatedBooking;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        console.error('Transaction failed:', error);
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
});
// Cancel Booking to db
const cancelBookingToDB = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const user = yield user_model_1.UserModel.findById(userId).session(session);
        if (!user) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "You are not authorized");
        }
        const booking = yield booking_model_1.BookingModel.findById(id).session(session);
        if (!booking) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Booking not found");
        }
        if (booking.status !== booking_1.BOOKING_STATUS.PENDING) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Booking is not pending. So you can not cancel it");
        }
        const provider = yield provider_model_1.ProviderModel.findById(booking.provider).session(session);
        if (!provider) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Provider not found");
        }
        const schedule = yield schedule_model_1.ScheduleModel.findById(booking.schedule).session(session);
        if (!schedule) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Schedule not found");
        }
        // Restore available slots
        schedule.available_slots.push(...booking.slots);
        schedule.count = schedule.count - 1;
        yield schedule.save({ session });
        // Update booking status
        booking.status = booking_1.BOOKING_STATUS.CANCELLED;
        const res = yield booking.save({ session });
        // If the user cancelled the booking
        if (user.role === user_1.USER_ROLES.USER) {
            const date = new Date();
            const currentTime = date.getTime();
            const bookingTime = new Date(booking === null || booking === void 0 ? void 0 : booking.createdAt).getTime();
            const isExistSystem = yield system_model_1.SystemModel.findOne({}).lean();
            const penaltyTime = (isExistSystem === null || isExistSystem === void 0 ? void 0 : isExistSystem.penaltyTime) || 1;
            const timeDiffInHours = (currentTime - bookingTime) / (1000 * 60 * 60);
            if (timeDiffInHours <= penaltyTime) {
                // Cancelled within penalty window (partial refund)
                const chargeAmount = booking.amount * 0.7;
                const revenueAmount = booking.amount * 0.3;
                yield user_model_1.UserModel.findByIdAndUpdate(booking.user, {
                    $inc: { credits: yield rsdCreditsConver_1.RsdCreditsTransformation.rsdToCredits(chargeAmount) },
                }, { session });
                yield revenue_model_1.RevenueModel.create([
                    {
                        user: booking.user,
                        revenue: revenueAmount,
                    },
                ], { session });
                (0, notificationHelper_1.sendNotifications)({
                    type: notification_constants_1.NOTIFICATION_TYPE.BOOKING_STATUS,
                    title: 'Booking Completed Successfully',
                    receiver: booking === null || booking === void 0 ? void 0 : booking.providerId,
                    referenceId: booking === null || booking === void 0 ? void 0 : booking.user,
                });
            }
            else {
                // Full refund
                yield user_model_1.UserModel.findByIdAndUpdate(booking.user, {
                    $inc: { credits: yield rsdCreditsConver_1.RsdCreditsTransformation.rsdToCredits(booking.amount) },
                }, { session });
                (0, notificationHelper_1.sendNotifications)({
                    type: notification_constants_1.NOTIFICATION_TYPE.BOOKING_STATUS,
                    title: 'Booking Completed Successfully',
                    receiver: booking === null || booking === void 0 ? void 0 : booking.providerId,
                    referenceId: booking === null || booking === void 0 ? void 0 : booking.user,
                });
            }
        }
        // If provider cancels the booking
        else if (user.role === user_1.USER_ROLES.PROVIDER) {
            yield user_model_1.UserModel.findByIdAndUpdate(booking.user, {
                $inc: { credits: yield rsdCreditsConver_1.RsdCreditsTransformation.rsdToCredits(booking.amount) },
            }, { session });
            (0, notificationHelper_1.sendNotifications)({
                type: notification_constants_1.NOTIFICATION_TYPE.BOOKING_STATUS,
                title: 'Booking Completed Successfully',
                receiver: booking === null || booking === void 0 ? void 0 : booking.user,
                referenceId: booking === null || booking === void 0 ? void 0 : booking.providerId,
            });
        }
        // ✅ Commit transaction if everything passed
        yield session.commitTransaction();
        session.endSession();
        return res;
    }
    catch (error) {
        // ❌ Rollback if anything failed
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
// get overview from db
const getOverviewFromDB = (id, filter) => __awaiter(void 0, void 0, void 0, function* () {
    const provider = yield provider_model_1.ProviderModel.findOne({ user: id });
    if (!provider) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Provider not found");
    }
    const matchConditions = { provider: provider._id };
    // ✅ Only add $expr if any date filter is provided
    if ((filter === null || filter === void 0 ? void 0 : filter.year) || (filter === null || filter === void 0 ? void 0 : filter.month) || (filter === null || filter === void 0 ? void 0 : filter.day)) {
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
    const overview = yield booking_model_1.BookingModel.aggregate([
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
});
// get booking details to db
const getBookingToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const booking = yield booking_model_1.BookingModel.findById(id);
    if (!booking) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Booking not found');
    }
    const provider = yield provider_model_1.ProviderModel.findById((_a = booking === null || booking === void 0 ? void 0 : booking.provider) === null || _a === void 0 ? void 0 : _a.toString());
    const ratings = yield review_service_1.ReviewService.getMyRatingsToDB((_b = provider === null || provider === void 0 ? void 0 : provider.user) === null || _b === void 0 ? void 0 : _b.toString());
    const res = yield booking_model_1.BookingModel.aggregate([
        {
            $match: {
                _id: new mongoose_1.Types.ObjectId(id),
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
    return [Object.assign(Object.assign({}, res[0]), { ratings: ratings.data })];
});
// get all bookings to db
const getBookingsToDB = (id, query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    // const currentHour = new Date().getHours();
    // const prevHour = new Date().setHours(currentHour - hours);
    const user = yield user_model_1.UserModel.findById(id);
    if (!user) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found');
    }
    let matchUserProvider = {};
    if (user.role === user_1.USER_ROLES.USER) {
        matchUserProvider = { user: new mongoose_1.Types.ObjectId(id) };
    }
    else if (user.role === user_1.USER_ROLES.PROVIDER) {
        const provider = yield provider_model_1.ProviderModel.findOne({ user: new mongoose_1.Types.ObjectId(id) });
        if (!provider) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Provider not found');
        }
        matchUserProvider = { provider: new mongoose_1.Types.ObjectId(provider._id) };
    }
    else {
        matchUserProvider = {};
    }
    if (query.date) {
        matchUserProvider.date = new Date(query.date);
    }
    if (query.status) {
        matchUserProvider.status = query.status;
    }
    const res = yield booking_model_1.BookingModel.aggregate([
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
    ]);
    const resData = (_a = res[0]) === null || _a === void 0 ? void 0 : _a.data;
    const totalCount = res[0].totalCount[0] ? res[0].totalCount[0].count : 0;
    const meta = {
        page: page,
        limit: limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
    };
    return { data: resData, meta: meta };
});
// get all bookings for admin dashboard to db
const getBookingsForAdminFromDB = (id, query) => __awaiter(void 0, void 0, void 0, function* () {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    // const currentHour = new Date().getHours();
    // const prevHour = new Date().setHours(currentHour - hours);
    const user = yield user_model_1.UserModel.findById(id);
    if (!user) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found');
    }
    let matchUserProvider = {};
    if (user.role === user_1.USER_ROLES.USER) {
        matchUserProvider = { user: new mongoose_1.Types.ObjectId(id) };
    }
    else if (user.role === user_1.USER_ROLES.PROVIDER) {
        const provider = yield provider_model_1.ProviderModel.findOne({ user: new mongoose_1.Types.ObjectId(id) });
        if (!provider) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Provider not found');
        }
        matchUserProvider = { provider: new mongoose_1.Types.ObjectId(provider._id) };
    }
    else {
        matchUserProvider = {};
    }
    if (query.date) {
        matchUserProvider.date = new Date(query.date);
    }
    if (query.status) {
        matchUserProvider.status = query.status;
    }
    const pipeline = [];
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
    pipeline.push({
        $match: matchUserProvider
    });
    pipeline.push({
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
    });
    pipeline.push({
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
    }, {
        $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
        }
    }, {
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
    }, {
        $unwind: {
            path: '$provider',
            preserveNullAndEmptyArrays: true,
        }
    });
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
    const res = yield booking_model_1.BookingModel.aggregate(pipeline);
    const resData = res[0].data;
    const totalCount = res[0].totalCount[0] ? res[0].totalCount[0].count : 0;
    const meta = {
        page: page,
        limit: limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
    };
    return { data: resData, meta: meta };
});
// get all bookings for admin dashboard to db
const getBookingsDownloadDB = (id, query) => __awaiter(void 0, void 0, void 0, function* () {
    let matchUserProvider = {};
    if (query.status) {
        matchUserProvider.status = query.status;
    }
    const pipeline = [];
    pipeline.push({
        $match: matchUserProvider
    });
    pipeline.push({
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
    });
    pipeline.push({
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
    }, {
        $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
        }
    }, {
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
    }, {
        $unwind: {
            path: '$provider',
            preserveNullAndEmptyArrays: true,
        }
    });
    const res = yield booking_model_1.BookingModel.aggregate(pipeline);
    return { data: res !== null && res !== void 0 ? res : [] };
});
exports.BookingService = {
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
