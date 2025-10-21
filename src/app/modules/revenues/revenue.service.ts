import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IRevenue } from './revenue.interface';
import { RevenueModel } from './revenue.model';
import { UserModel } from '../user/user.model';
import { CreditsModel } from '../credits/credits.model';


// get revenues yearly summary
const getRevenuesFromDB = async (year: number): Promise<any> => {
  const data = await RevenueModel.aggregate([
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
        totalCredits: { $sum: "$revenue" },
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
      revenue: monthData ? monthData.totalCredits : 0,
    };
  });

  return { year, data: result };
};

// get revenues yearly summary
const generalStateFromDB = async (): Promise<any> => {

  const userDatas = await UserModel.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: {
          $sum: {
            $cond: [{ $eq: ["$role", "USER"] }, 1, 0],
          },
        },
        totalProviders: {
          $sum: {
            $cond: [{ $eq: ["$role", "PROVIDER"] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalUsers: 1,
        totalProviders: 1,
      },
    },
  ]);

  const revenueDatas = await RevenueModel.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$revenue" },
      },
    },
    {
      $project: {
        _id: 0,
        totalRevenue: 1,
      },
    },
  ]);

  const creditDatas = await CreditsModel.aggregate([
    {
      $group: {
        _id: null,
        totalCredits: { $sum: "$credits" },
      },
    },
    {
      $project: {
        _id: 0,
        totalCredits: 1,
      },
    },
  ]);



  const result = {
    totalUser: userDatas[0]?.totalUsers || 0,
    totalProvider: userDatas[0]?.totalProviders || 0,
    distributedCredit: creditDatas[0]?.totalCredits || 0,
    totalRevenue: revenueDatas[0]?.totalRevenue || 0
  }

  return { data: result };
};


export const RevenueService = {
  getRevenuesFromDB,
  generalStateFromDB
};
