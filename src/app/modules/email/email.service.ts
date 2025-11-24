import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { logger } from '../../../shared/logger';
import colors from 'colors';
import { emailQueue } from '../../queues/email.queue';


// create system automatically to db
const sendEmailFromDB = async (data: {
  to: string;
  subject: string;
  html: string;
}): Promise<any> => {

  await emailQueue.add('send-email', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  });

  return { message: "BullMQ - Email sent successfully" };
};



export const EmailService = {
  sendEmailFromDB,
};
