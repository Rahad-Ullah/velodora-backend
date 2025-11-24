"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceValidation = void 0;
const zod_1 = require("zod");
const createScheduleZodSchema = zod_1.z.object({
    data: zod_1.z.object({
        provider: zod_1.z.string({ required_error: 'Provider is required' }),
        date: zod_1.z.string({ required_error: 'About me is required' }),
        startTime: zod_1.z.string({ required_error: 'Start Time is required' }),
        endTime: zod_1.z.string({ required_error: 'Start Time is required' }),
        duration: zod_1.z.number({ required_error: 'Duration is required' })
    })
});
const updateScheduleZodSchema = zod_1.z.object({
    data: zod_1.z.object({
        provider: zod_1.z.string({ required_error: 'Provider is required for schedule' }),
        date: zod_1.z.string({ required_error: 'About me is required' }),
        startTime: zod_1.z.string({ required_error: 'Start Time is required' }),
        endTime: zod_1.z.string({ required_error: 'Start Time is required' }),
        duration: zod_1.z.number({ required_error: 'Duration is required' })
    })
});
exports.ServiceValidation = {
    createScheduleZodSchema,
    updateScheduleZodSchema,
};
