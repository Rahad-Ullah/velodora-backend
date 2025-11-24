"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnection = void 0;
const redis_1 = require("redis");
exports.redisConnection = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});
exports.redisConnection.on('error', (err) => console.error('Redis Client Error', err));
exports.redisConnection.connect();
