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
exports.autoCancelBookings = void 0;
const http_status_codes_1 = require("http-status-codes");
const booking_model_1 = require("../app/modules/booking/booking.model");
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const booking_1 = require("../enums/booking");
const provider_model_1 = require("../app/modules/provider/provider.model");
const schedule_model_1 = require("../app/modules/schedule/schedule.model");
const user_model_1 = require("../app/modules/user/user.model");
const autoCancelBookings = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() - 10);
    // Find bookings created more than 5 min ago and unpaid
    const bookings = yield booking_model_1.BookingModel.find({
        paymentStatus: booking_1.BOOKING_PAYMENT_STATUS.UNPAID,
        status: booking_1.BOOKING_STATUS.PENDING,
        createdAt: { $lt: currentTime }
    });
    // Check bookings length
    if (bookings.length <= 0) {
        return;
    }
    try {
        for (const booking of bookings) {
            const provider = yield provider_model_1.ProviderModel.findById(booking.provider);
            if (!provider) {
                continue;
            }
            const schedule = yield schedule_model_1.ScheduleModel.findById(booking.schedule);
            if (!schedule) {
                continue;
            }
            // ⏳ Restore slots
            schedule.available_slots.push(...booking.slots);
            schedule.count = Math.max(schedule.count - 1, 0);
            yield schedule.save();
            yield user_model_1.UserModel.findByIdAndUpdate(booking.user, {
                $inc: { 'credits': booking === null || booking === void 0 ? void 0 : booking.useCredits }
            });
            // ❌ Delete booking
            const result = yield booking_model_1.BookingModel.findByIdAndDelete(booking._id);
            if (!result) {
                continue;
            }
        }
    }
    catch (error) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : "Something went wrong in autoCancelBookings");
    }
});
exports.autoCancelBookings = autoCancelBookings;
