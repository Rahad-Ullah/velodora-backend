import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ScheduleModel } from './schedule.model';
import { generateSlots } from '../../../util/generateSlots';
import mongoose, { Types } from 'mongoose';
import { ProviderModel } from '../provider/provider.model';


//create schedule to db
const createScheduleToDB = async (payload: {
  provider: string,
  date: Date;
  startTime: Date;
  endTime: Date;
  duration: number;
}): Promise<any> => {

  const currentDate = new Date();
  const userDate = new Date(payload.date);
  if (userDate < currentDate) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Date must be greater than current date');
  }

  const isExistSchedule = await ScheduleModel.findOne({
    provider: payload.provider,
    date: payload.date,
  });

  if (isExistSchedule && (isExistSchedule.count > 0)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `Schedule already exists And Have bookings = ${isExistSchedule.count}`);
  }

  const available_slots = generateSlots(
    payload.startTime,
    payload.endTime,
    payload.duration
  );
  // console.log("provider payload in schedule service: ", payload);

  let schedule: any;

  if (isExistSchedule && (isExistSchedule.count <= 0)) {
    isExistSchedule.startTime = payload.startTime;
    isExistSchedule.endTime = payload.endTime;
    isExistSchedule.duration = payload.duration;
    isExistSchedule.available_slots = available_slots;

    schedule = await isExistSchedule.save();
  } else {
    schedule = await ScheduleModel.create({
      ...payload,
      // provider: payload.provider,
      available_slots,
    })
  };

  return {data: schedule};
};

//get schedule to db
const getScheduleToDB = async (id: string): Promise<any> => {

  const schedule = await ScheduleModel.findById(id);
  if (!schedule) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Schedule not found');
  }

  return {data: schedule};
};

//get schedule to db
const openCloseScheduleToDB = async (id: string): Promise<any> => {

  const schedule = await ScheduleModel.findById(id);
  if (!schedule) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Schedule not found');
  }
  schedule.isActive = !schedule.isActive;
  await schedule.save();

  return {data: schedule};
};

//get schedules to db
const getSchedulesToDB = async (providerId: string): Promise<any> => {
  console.log("providerId in schedule service: ", providerId);

  const provider = await ProviderModel.findOne({ user: providerId });

  if (!provider) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Provider not found');
  }
  console.log("provider in schedule service: ", provider);

  const schedules = await ScheduleModel.aggregate([
    {
      $match: {
        provider: new mongoose.Types.ObjectId(provider._id),
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
            $match: { ref: { $exists: false } }
          }
        ]
      }
    },
    {
      $unwind: "$provider"
    },
    {
      $project: {
        date: 1,
        startTime: 1,
        endTime: 1,
        duration: 1,
        count: 1
      }
    }
  ]);

  if (schedules.length <= 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Schedules not found');
  }

  return {data: schedules};
};

export const ScheduleService = {
  createScheduleToDB,
  getScheduleToDB,
  getSchedulesToDB,
  openCloseScheduleToDB,
};