"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailWorker = void 0;
const bullmq_1 = require("bullmq");
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../../../config"));
const logger_1 = require("../../../shared/logger");
const transporter = nodemailer_1.default.createTransport({
    host: config_1.default.email.host,
    port: Number(config_1.default.email.port),
    secure: false,
    auth: {
        user: config_1.default.email.from,
        pass: config_1.default.email.pass,
    },
});
exports.emailWorker = new bullmq_1.Worker('email-queue', (job) => __awaiter(void 0, void 0, void 0, function* () {
    const { to, subject, html } = job.data;
    const info = yield transporter.sendMail({
        from: config_1.default.email.from,
        to: to,
        subject: subject,
        html: html,
    });
    logger_1.logger.info('Mail send successfully', info.accepted);
}), {
    connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT) || 6379,
    },
});
exports.emailWorker.on('completed', (job) => {
    console.log(`Job completed: ${job.id}`);
});
exports.emailWorker.on('failed', (job, err) => {
    console.error(`Job failed ${job === null || job === void 0 ? void 0 : job.id}: ${err}`);
});
