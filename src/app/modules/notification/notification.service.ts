import { FilterQuery } from 'mongoose';
import { NotificationModel } from './notification.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { timeAgo } from '../../../util/timeAgo';

// ----------------- get notification by user id -----------------
const getUserNotificationFromDB = async (
  userId: string,
  query: FilterQuery<any>
): Promise<Object> => {
  const notificationQuery = new QueryBuilder(
    NotificationModel.find({ receiver: userId }).sort('-createdAt'),
    query
  ).paginate();

  const [notifications, pagination, unreadCount] = await Promise.all([
    notificationQuery.modelQuery.lean().exec(),
    notificationQuery.getPaginationInfo(),
    NotificationModel.countDocuments({ receiver: userId, isRead: false }),
  ]);

  return {
    notifications: notifications.map((notification: any) => {
      return {
        ...notification,
        timeAgo: timeAgo(notification.createdAt),
      };
    }),
    pagination,
    unreadCount,
  };
};

// ----------------- mark all notifications as read -----------------
const readUserNotificationToDB = async (userId: string): Promise<boolean> => {
  await NotificationModel.bulkWrite([
    {
      updateMany: {
        filter: { receiver: userId, isRead: false },
        update: { $set: { isRead: true } },
        upsert: false,
      },
    },
  ]);

  return true;
};

export const NotificationServices = { getUserNotificationFromDB, readUserNotificationToDB };