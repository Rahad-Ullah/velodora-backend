"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const createUserZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: 'Name is required' }),
        role: zod_1.z.enum(['USER', 'PROVIDER']),
        contact: zod_1.z.string({ required_error: 'Contact is required' }),
        countryCode: zod_1.z.string({ required_error: 'Country code is required' }),
        email: zod_1.z.string({ required_error: 'Email is required' }),
        password: zod_1.z.string({ required_error: 'Password is required' }),
        location: zod_1.z.string({ required_error: 'Location is required' }),
        profile: zod_1.z.string().optional(),
    }),
});
const updateUserZodSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    contact: zod_1.z.string().optional(),
    countryCode: zod_1.z.string().optional(),
    email: zod_1.z.string().optional(),
    password: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
});
exports.UserValidation = {
    createUserZodSchema,
    updateUserZodSchema,
};
