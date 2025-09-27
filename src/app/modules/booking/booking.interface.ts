import { Model, Types } from "mongoose";
import { BOOKING_STATUS } from "../../../enums/booking";

export type TBooking = {
  user: Types.ObjectId;
  provider: Types.ObjectId;
  services: [Types.ObjectId];
  schedule: Types.ObjectId;
  date: Date;
  slots: [{start: Date; end: Date;}];
  amount: number;
  paymentId: string;
  status: BOOKING_STATUS;
};

export type TBookingModel = Model<TBooking>;