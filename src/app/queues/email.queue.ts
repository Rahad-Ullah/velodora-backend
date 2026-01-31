import { Queue } from 'bullmq';
import { ISendEmail } from '../../types/email';

export const emailQueue = new Queue<ISendEmail>('email-queue', {
  connection: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
  },
});