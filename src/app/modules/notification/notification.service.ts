import { Types } from 'mongoose';
import { NotificationModel } from './notification.model';
import { readNotifications } from '../../../helpers/notificationHelper';

// ----------------- get notification by user id ----------------- //
const getUserNotificationAmountFromDB = async (
  userId: string
): Promise<any> => {

  const result = await NotificationModel.countDocuments({
    receiver: new Types.ObjectId(userId),
    isRead: false
  });

  return {result};
};

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
        // 1️⃣ Main data: all notifications (read + unread)
        notifications: [
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
          // 🧠 Sort unread first, then by newest date
          { $sort: { isRead: 1, createdAt: -1 } },
          { $skip: skip },
          { $limit: limit }
        ],

        // 2️⃣ Count total unread notifications
        unreadCount: [
          { $match: { isRead: false } },
          { $count: 'count' }
        ],

        // 3️⃣ Count total notifications
        totalCount: [
          { $count: 'count' }
        ]
      }
    }
  ]);

  // Extract data safely
  const notifications = result[0]?.notifications || [];
  const unreadNotifications = result[0]?.unreadCount[0]?.count || 0;
  const total = result[0]?.totalCount[0]?.count || 0;
  const totalPage = Math.ceil(total / limit);

  return {
    notifications,
    pagination: {
      page,
      limit,
      totalPage,
      total,
      unreadNotifications,
    },
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

  await readNotifications(userId);

  return true;
};

export const NotificationServices = { getUserNotificationFromDB, readUserNotificationToDB, getUserNotificationAmountFromDB };