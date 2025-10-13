import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { generateUniqueReferralCode } from '../../../util/generateRefferalCode';
import { ReferralModel } from './referral.model';
import { IPaginationOptions } from '../../../types/pagination';

// get referral code from DB
const getReferralFromDB = async (adminId: string) => {
  // Generate unique code
  const code = await generateUniqueReferralCode();

  const newReferral = { code, createdBy: adminId }

  // Save in DB
  const referral = await ReferralModel.create(newReferral);

  if (!referral) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create referral');
  }

  return { code, message: "Referral code created successfully" };
};

// delete referral code from DB
const deleteReferralFromDB = async (referralCodeId: string) => {

  // Delete from  DB
  const referral = await ReferralModel.findByIdAndDelete(referralCodeId);

  if (!referral) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create referral');
  }

  return { message: "Referral code deleted successfully" };
};

// get all referrals from DB
const getReferralsListFromDB = async ({ referralCode, status, paginationOptions }: { referralCode?: string, status?: string, paginationOptions: IPaginationOptions }) => {
  const { page = 1, limit = 10 } = paginationOptions;
  const skip = (page - 1) * limit;

  const isStatus: boolean = status === 'active' ? false : true;

  const pipeline: any[] = [
    {
      $sort: {
        createdAt: -1
      }
    }
  ];

  if (referralCode) {
    pipeline.push({
      $match: {
        code: { $regex: referralCode }  // 'i' = case-insensitive
      }
    });
  }


  if (status === 'active' || status === 'used') {
    pipeline.push({ $match: { isUsed: isStatus } });
  }

  pipeline.push(
    {
      $lookup: {
        from: 'users',
        localField: 'usedBy',
        foreignField: '_id',
        as: 'usedBy',
        pipeline: [
          {
            $project: {
              name: 1,
              email: 1,
              contact: 1,
              location: 1
            }
          }
        ]
      }
    },
    {
      $unwind: {
        path: '$usedBy',
        preserveNullAndEmptyArrays: true
      }
    }
  );


  pipeline.push(
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              __v: 0,
            },
          },
        ],
        countData: [
          { $count: "total" }
        ],
      },
    },
    {
      $addFields: {
        total: { $ifNull: [{ $arrayElemAt: ["$countData.total", 0] }, 0] },
        limit: limit,
        page: page,
        totalPage: {
          $ceil: { $divide: [{ $ifNull: [{ $arrayElemAt: ["$countData.total", 0] }, 0] }, limit] }
        }
      }
    },
    {
      $project: {
        data: 1,
        pagination: {
          total: "$total",
          limit: "$limit",
          page: "$page",
          totalPage: "$totalPage",
        }
      }
    }
  );

  // Save in DB
  const referrals: any = await ReferralModel.aggregate(pipeline);

  console.log(referrals?.pagination)

  const meta = referrals[0]?.pagination || {
    total: 0,
    limit,
    page,
    totalPage: 0,
  };

  return { data: referrals[0]?.data || [], meta: meta };
};


export const ReferralService = {
  getReferralFromDB,
  deleteReferralFromDB,
  getReferralsListFromDB,
};
