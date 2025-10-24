import { INotification } from '../app/modules/notification/notification.interface';
import { NotificationModel } from '../app/modules/notification/notification.model';


// Send notification to user
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

// Read notification from user
export const readNotifications = async (
  receiver: string
) => {

  //@ts-ignore
  const io = global.io;

  if (io) {
    io.emit(`readNotification::${receiver}`, "read");
  }
};