import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ScheduleModel } from './schedule.model';
import { generateSlots } from '../../../util/generateSlots';
import mongoose, { Types } from 'mongoose';
import { ProviderModel } from '../provider/provider.model';


//create schedule to db
const createScheduleToDB = async (userId: string, payload: {
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

  const provider = await ProviderModel.findOne({ user: userId });
  if (!provider) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Provider not found');
  }

  const isExistSchedule = await ScheduleModel.findOne({
    provider: provider._id,
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
      provider: provider._id,
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
// const getSchedulesToDB = async (providerId: string, date?: Date): Promise<any> => {
//   console.log("providerId in schedule service: ", providerId);

//   const provider = await ProviderModel.findOne({ user: providerId });

//   if (!provider) {
//     throw new ApiError(StatusCodes.NOT_FOUND, 'Provider not found');
//   }
//   // console.log("provider in schedule service: ", provider);

//   const schedules = await ScheduleModel.aggregate([
//     {
//       $match: {
//         provider: new mongoose.Types.ObjectId(provider._id),
//       }
//     },
//     {
//       $lookup: {
//         from: 'providers',
//         localField: 'provider',
//         foreignField: '_id',
//         as: 'provider',
//         pipeline: [
//           {
//             $match: { ref: { $exists: false } }
//           }
//         ]
//       }
//     },
//     {
//       $unwind: "$provider"
//     },
//     {
//       $project: {
//         date: 1,
//         startTime: 1,
//         endTime: 1,
//         duration: 1,
//         count: 1
//       }
//     }
//   ]);

//   if (schedules.length <= 0) {
//     throw new ApiError(StatusCodes.NOT_FOUND, 'Schedules not found');
//   }

//   return {data: schedules};
// };


export const getSchedulesToDB = async (providerId: string, date?: string): Promise<any> => {
  console.log("providerId in schedule service:", providerId);

  const provider = await ProviderModel.findOne({ user: providerId });

  if (!provider) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Provider not found");
  }

  // 🕒 Handle date without any library
  let startDate: Date;
  let endDate: Date;

  if (date) {
    const d = new Date(date);
    // Normalize to start of the day (00:00:00)
    startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
    // End date = start date + 7 days at 23:59:59
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    endDate.setHours(23, 59, 59, 999);
  } else {
    const today = new Date();
    startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    endDate.setHours(23, 59, 59, 999);
  }

  console.log("Schedule Date Range:", startDate, "to", endDate);

  const schedules = await ScheduleModel.aggregate([
    {
      $match: {
        provider: new mongoose.Types.ObjectId(provider._id),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $lookup: {
        from: "providers",
        localField: "provider",
        foreignField: "_id",
        as: "provider",
        pipeline: [{ $match: { ref: { $exists: false } } }]
      }
    },
    { $unwind: "$provider" },
    {
      $project: {
        date: 1,
        startTime: 1,
        endTime: 1,
        duration: 1,
        count: 1,
        isActive: 1,
        // "provider._id": 1,
        // "provider.name": 1
      }
    },
    { $sort: { date: 1, startTime: 1 } }
  ]);

  if (!schedules || schedules.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Schedules not found for the given period");
  }

  return { data: schedules };
};


export const ScheduleService = {
  createScheduleToDB,
  getScheduleToDB,
  getSchedulesToDB,
  openCloseScheduleToDB,
};