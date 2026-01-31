import { Worker, Job } from 'bullmq';
// import nodemailer from 'nodemailer';
import config from '../../../config';
import { logger } from '../../../shared/logger';
import { transporter } from '../../../helpers/emailHelper';

// use below command to run the worker
// Production: dist/app/queues/workers/email.worker.js
// Development: src/app/queues/workers/email.worker.js
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
