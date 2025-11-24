import { Worker, Job } from 'bullmq';
import nodemailer from 'nodemailer';
import config from '../../../config';
import { logger } from '../../../shared/logger';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: Number(config.email.port),
  secure: false,
  auth: {
    user: config.email.from,
    pass: config.email.pass,
  },
});

// use below command to run the worker
// node dist/app/queues/workers/email.worker.js
export const emailWorker = new Worker( 'email-queue', 
  async (job: Job) => {
    const { to, subject, html } = job.data as any;

    const info = await transporter.sendMail({
      from: config.email.from,
      to: to,
      subject: subject,
      html: html,
    });

    logger.info('Mail send successfully', info.accepted);
  },
  {
    connection: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
    },
  }
);

emailWorker.on('completed', (job) => {
  console.log(`Job completed: ${job.id}`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Job failed ${job?.id}: ${err}`);
});
