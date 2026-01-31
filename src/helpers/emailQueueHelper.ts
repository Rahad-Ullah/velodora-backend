import { emailQueue } from "../app/queues/email.queue";
import { errorLogger } from "../shared/logger";

export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export const emailQueueHelper = async (data: EmailData) => {
  try {
    await emailQueue.add('send-email', data, {
      attempts: 1,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  } catch (error) {
    errorLogger.error('Email Queue', error);
  }
}