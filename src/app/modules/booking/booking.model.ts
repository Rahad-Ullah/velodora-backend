import { Schema, model } from "mongoose";
import { TBooking, TBookingModel } from "./booking.interface";
import { BOOKING_STATUS } from "../../../enums/booking";

const BookingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: Schema.Types.ObjectId, ref: "Provider", required: true },
    services: [{ type: Schema.Types.ObjectId, ref: "Service", required: true }],
    date: { type: Date, required: true },
    slots: [{ start: { type: Date, required: true }, end: { type: Date, required: true } }],
    amount: { type: Number, required: true },
    paymentId: { type: String, required: true },
    status: { type: String, enum: Object.values(BOOKING_STATUS), default: BOOKING_STATUS.PENDING },
  },
  { timestamps: true }
);

export const BookingModel = model<TBooking, TBookingModel>(
  "Booking",
  BookingSchema
);