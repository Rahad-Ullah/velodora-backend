"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingModel = void 0;
const mongoose_1 = require("mongoose");
const booking_1 = require("../../../enums/booking");
const BookingSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    providerId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: mongoose_1.Schema.Types.ObjectId, ref: "Provider", required: true },
    services: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Service", required: true }],
    schedule: { type: mongoose_1.Schema.Types.ObjectId, ref: "Schedule", required: true },
    date: { type: Date, required: true },
    slots: [{ start: { type: Date, required: true }, end: { type: Date, required: true } }],
    amount: { type: Number, required: true },
    paymentId: { type: String },
    chatId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Chat", default: null },
    status: { type: String, enum: Object.values(booking_1.BOOKING_STATUS), default: booking_1.BOOKING_STATUS.PENDING },
    paymentStatus: { type: String, enum: Object.values(booking_1.BOOKING_PAYMENT_STATUS), default: booking_1.BOOKING_PAYMENT_STATUS.UNPAID },
    subTotal: { type: Number, required: true },
    promoCode: { type: String },
    weatherFee: { type: Number, default: 0 },
    convenienceFee: { type: Number, default: 0 },
    arrivalFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    useCredits: { type: Number, default: 0 },
    revenueId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Revenue", default: null },
}, { timestamps: true });
exports.BookingModel = (0, mongoose_1.model)("Booking", BookingSchema);
