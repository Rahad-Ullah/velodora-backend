import { Schema, model } from "mongoose";
import { TBooking, TBookingModel } from "./booking.interface";
import { BOOKING_PAYMENT_STATUS, BOOKING_STATUS } from "../../../enums/booking";

const BookingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    providerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: Schema.Types.ObjectId, ref: "Provider", required: true },
    services: [{ type: Schema.Types.ObjectId, ref: "Service", required: true }],
    schedule: { type: Schema.Types.ObjectId, ref: "Schedule", required: true },
    date: { type: Date, required: true },
    slots: [{ start: { type: Date, required: true }, end: { type: Date, required: true } }],
    amount: { type: Number, required: true },
    paymentId: { type: String },
    chatId: { type: Schema.Types.ObjectId, ref: "Chat" , default: null},
    status: { type: String, enum: Object.values(BOOKING_STATUS), default: BOOKING_STATUS.PENDING },
    paymentStatus: { type: String, enum: Object.values(BOOKING_PAYMENT_STATUS), default: BOOKING_PAYMENT_STATUS.UNPAID },
    subTotal: { type: Number, required: true },
    promoCode: { type: String },
    weatherFee: { type: Number, default: 0 },
    convenienceFee: { type: Number, default: 0 },
    arrivalFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    useCredits: { type: Number, default: 0 },
    revenueId: { type: Schema.Types.ObjectId, ref: "Revenue", default: null },
    image: { type: String },
    bookingDescription: { type: String },
  },
  { timestamps: true }
);

export const BookingModel = model<TBooking, TBookingModel>(
  "Booking",
  BookingSchema
);