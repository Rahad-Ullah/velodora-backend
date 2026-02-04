import { Model, Types } from "mongoose";
import { BOOKING_PAYMENT_STATUS, BOOKING_STATUS } from "../../../enums/booking";

export type TBooking = {
  user: Types.ObjectId;
  providerId: Types.ObjectId;
  provider: Types.ObjectId;
  services: [Types.ObjectId];
  schedule: Types.ObjectId;
  date: Date;
  slots: [{start: Date; end: Date;}];
  amount: number;
  paymentId: string;
  chatId: Types.ObjectId;
  status: BOOKING_STATUS;
  paymentStatus: BOOKING_PAYMENT_STATUS;
  subTotal: number;
  promoCode?: string;
  weatherFee?: number;
  convenienceFee?: number;
  arrivalFee?: number;
  discount?: number;
  useCredits?: number;
  revenueId?: Types.ObjectId;
  image?: string;
  bookingDescription?: string;
};

export type TBookingModel = Model<TBooking>;