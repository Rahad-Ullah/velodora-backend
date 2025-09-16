import { Model, Types } from 'mongoose';
import { NOTIFICATION_TYPE } from './notification.constants';

export type INotification = {
  _id: Types.ObjectId;
  type: NOTIFICATION_TYPE;
  title: string;
  receiver: Types.ObjectId;
  referenceId: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type TNotificationModel = Model<INotification>;
