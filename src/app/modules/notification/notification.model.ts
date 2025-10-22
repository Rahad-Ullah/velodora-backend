import { Schema, model } from 'mongoose';
import { INotification, TNotificationModel } from './notification.interface';
import { NOTIFICATION_TYPE } from './notification.constants';

const notificationSchema = new Schema<INotification, TNotificationModel>(
  {
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPE),
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const NotificationModel = model<INotification, TNotificationModel>(
  'Notification',
  notificationSchema
);
