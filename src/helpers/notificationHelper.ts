import { INotification } from '../app/modules/notification/notification.interface';
import { NotificationModel } from '../app/modules/notification/notification.model';

export const sendNotifications = async (
  payload: Partial<INotification>
): Promise<INotification> => {
  const result = await NotificationModel.create(payload);

  //@ts-ignore
  const io = global.io;
  
  if (io) {
    io.emit(`getNotification::${payload?.receiver}`, result);
  }

  return result;
};
