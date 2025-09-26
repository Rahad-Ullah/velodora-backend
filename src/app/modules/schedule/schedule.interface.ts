import { Model, Types } from "mongoose";

export type TSchedule = {
  provider: Types.ObjectId;
  date: Date;
  startTime: Date;
  endTime: Date;
  duration: number;
  count: number;
  available_slots: {
    start: Date; 
    end: Date;
  }[];
  isActive: boolean;
};

export type TScheduleModel = Model<TSchedule>;
