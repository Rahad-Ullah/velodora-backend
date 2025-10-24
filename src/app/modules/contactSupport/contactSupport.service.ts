import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ContactSupportModel } from './contactSupport.model';
import { IContactSupport } from './contactSupport.interface';
import { Types } from 'mongoose';
import { emailTemplate } from '../../../shared/emailTemplate';
import { emailHelper } from '../../../helpers/emailHelper';


//create contact support
const createContactSupportToDB = async (userId: string, payload: Partial<IContactSupport>): Promise<any> => {

  const newContactSupport = {
    user: new Types.ObjectId(userId),
    sub: payload.sub,
    msg: payload.msg,
  }

  const res = await ContactSupportModel.create(newContactSupport);
  if (!res) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Contact Support doesn't exist!");
  }

  return res;
};

// update contact support
const updateContactSupportToDB = async (id: string, reply: string): Promise<any> => {

  const res = await ContactSupportModel.findById(id).populate('user', 'email');
  if (!res) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Contact Support doesn't exist!");
  }
  if (res.isReply) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Already replied! Please Check through your email");
  }

  // Make sure user is properly populated
  if (!res.user || typeof res.user === 'string' || !('email' in res.user)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User information not available");
  }

  const values = {
    email: res.user.email as string,
    sub: res.sub,
    msg: res.msg,
    reply: reply,
  };
  const createAccountTemplate = emailTemplate.contactSupport(values);
  emailHelper.sendEmail(createAccountTemplate);

  res.reply = reply;
  res.isReply = true;
  await res.save();

  return res;
};

// get contact support
const getContactSupportToDB = async (id: string): Promise<any> => {
  const res = await ContactSupportModel.findById(id).populate('user', 'name email contact location');
  if (!res) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Contact Support doesn't exist!");
  }
  return res;
}

// get contact support with pagination
const getContactSupportsToDB = async (
  limit: number,
  pageNumber: number,
  status: string
): Promise<any> => {
  const skip = (pageNumber - 1) * limit;

  const isReply: boolean = status === 'solved' ? true : false;

  const pipeline: any[] = [];

  if (status === 'pending' || status === 'solved') {
    pipeline.push({ $match: { isReply: isReply } });
  }

  pipeline.push(
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
        pipeline: [
          {
            $project: {
              name: 1,
              email: 1,
              contact: 1,
              location: 1,
            },
          },
        ],
      },
    },
    { $unwind: '$user' },
  );

  pipeline.push(
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
        ],
        totalCount: [
          { $count: 'count' }
        ],
      },
    },
    {
      $unwind: {
        path: '$totalCount',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        data: 1,
        total: '$totalCount.count',
      },
    },
  )

  const result = await ContactSupportModel.aggregate(pipeline);

  const total = result[0]?.total || 0;
  const data = result[0]?.data || [];

  return {
    meta: {
      total,
      page: pageNumber,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data,
  };
};



export const ContactSupportService = {
  createContactSupportToDB,
  updateContactSupportToDB,
  getContactSupportToDB,
  getContactSupportsToDB
};