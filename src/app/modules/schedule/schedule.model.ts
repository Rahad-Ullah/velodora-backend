import { Schema, model } from "mongoose";
import { TSchedule, TScheduleModel } from "./schedule.interface";

const ScheduleSchema = new Schema(
  {
    provider: { type: Schema.Types.ObjectId, ref: "Provider", required: true },
    date: { type: Date, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    count: {
      type: Number,
      default: 0
    },
    available_slots: [
      {
        start: { type: Date, required: true },
        end: { type: Date, required: true }
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ScheduleModel = model<TSchedule, TScheduleModel>(
  "Schedule",
  ScheduleSchema
);
