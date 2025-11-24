"use strict";
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
exports.handlePaymentSuccess = void 0;
const user_model_1 = require("../app/modules/user/user.model");
const user_1 = require("../enums/user");
const booking_model_1 = require("../app/modules/booking/booking.model");
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const booking_1 = require("../enums/booking");
const http_status_codes_1 = require("http-status-codes");
const notificationHelper_1 = require("../helpers/notificationHelper");
const notification_constants_1 = require("../app/modules/notification/notification.constants");
const handlePaymentSuccess = (session) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Payment Successful...........handlePaymentSuccess");
    const { metadata } = session;
    const superAdmin = yield user_model_1.UserModel.findOne({ role: user_1.USER_ROLES.SUPER_ADMIN });
    // Test Payment - Send Notification to Super Admin
    if ((metadata === null || metadata === void 0 ? void 0 : metadata.paymentType) === 'testPayment') {
        (0, notificationHelper_1.sendNotifications)({
            type: notification_constants_1.NOTIFICATION_TYPE.PAYMENT,
            title: 'Test Payment Successful',
            receiver: superAdmin._id,
            referenceId: superAdmin._id,
        });
        return;
    }
    const bookingId = metadata === null || metadata === void 0 ? void 0 : metadata.bookingId;
    const isExistBooking = yield booking_model_1.BookingModel.findById(bookingId);
    if (!isExistBooking) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'After payment - Booking not found');
    }
    else if (isExistBooking.status !== booking_1.BOOKING_STATUS.PENDING) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'After payment - Booking status is not Pending');
    }
    if ((metadata === null || metadata === void 0 ? void 0 : metadata.paymentType) === 'bookingPayment') {
        const booking = yield booking_model_1.BookingModel.findByIdAndUpdate(metadata === null || metadata === void 0 ? void 0 : metadata.bookingId, {
            $set: { paymentStatus: booking_1.BOOKING_PAYMENT_STATUS.PAID },
        });
        if (!booking) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'After payment - Failed to update Booking payment status');
        }
        (0, notificationHelper_1.sendNotifications)({
            type: notification_constants_1.NOTIFICATION_TYPE.BOOKING_STATUS,
            title: 'You have a new booking',
            receiver: booking.providerId,
            referenceId: booking.user,
        });
    }
    return;
});
exports.handlePaymentSuccess = handlePaymentSuccess;
