"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueue = void 0;
const bullmq_1 = require("bullmq");
exports.emailQueue = new bullmq_1.Queue('email-queue', {
    connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT) || 6379,
    },
});
