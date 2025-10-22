import { Types } from 'mongoose';
import { NotificationModel } from './notification.model';

// ----------------- get notification by user id ----------------- //
const getUserNotificationFromDB = async (
  userId: string,
  query: { page?: number; limit?: number }
): Promise<any> => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const result = await NotificationModel.aggregate([
    {
      $match: {
        receiver: new Types.ObjectId(userId),
      },
    },
    {
      $facet: {
        // 👇 First pipeline for notifications with pagination
        notifications: [
          { $match: { isRead: false } },
          {
            $lookup: {
              from: 'users',
              localField: 'referenceId',
              foreignField: '_id',
              as: 'referenceId',
              pipeline: [
                { $project: { name: 1, email: 1, image: 1, contact: 1 } }
              ]
            }
          },
          { $unwind: { path: '$referenceId', preserveNullAndEmptyArrays: true } },
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit }
        ],
        // 👇 Third pipeline to get total count (for pagination)
        totalCount: [
          { $match: { isRead: false } },
          { $count: 'count' }
        ]
      }
    }
  ]);

  const notifications = result[0].notifications;
  const totalNotifications = result[0].totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalNotifications / limit);

  return {
    notifications,
    pagination: {
      page,
      limit,
      totalPages,
      totalNotifications,
    }
  };
};

// ----------------- mark all notifications as read -----------------
const readUserNotificationToDB = async (userId: string): Promise<boolean> => {
  await NotificationModel.bulkWrite([
    {
      updateMany: {
        filter: { receiver: new Types.ObjectId(userId), isRead: false },
        update: { $set: { isRead: true } },
        upsert: false,
      },
    },
  ]);

  return true;
};

export const NotificationServices = { getUserNotificationFromDB, readUserNotificationToDB };