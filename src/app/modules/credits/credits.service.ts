import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICredits } from './credits.interface';
import { CreditsModel } from './credits.model';


//create sub category
const createCreditToDB = async (payload: Partial<ICredits>): Promise<any> => {

  const res = await CreditsModel.create(payload);
  if (!res) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create credits!");
  }

  return { data: res };
};


// get credits yearly summary
const getCreditsFromDB = async (year: number): Promise<any> => {
  const data = await CreditsModel.aggregate([
    // 1️⃣ Match by selected year
    {
      $match: {
        $expr: {
          $eq: [{ $year: "$createdAt" }, year],
        },
      },
    },

    // 2️⃣ Group by month and sum credits
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        totalCredits: { $sum: "$credits" },
      },
    },

    // 3️⃣ Sort by month ascending
    {
      $sort: { "_id.month": 1 },
    },
  ]);

  // 4️⃣ Map Mongo months (1–12) to names & ensure all months exist
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // initialize array with all months (default 0 credits)
  const result = monthNames.map((month, index) => {
    const monthData = data.find((item) => item._id.month === index + 1);
    return {
      month,
      credits: monthData ? monthData.totalCredits : 0,
    };
  });

  return { year, data: result };
};


export const CreditsService = {
  createCreditToDB,
  getCreditsFromDB
};
