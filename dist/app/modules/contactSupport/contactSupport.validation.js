"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactSupportValidation = void 0;
const zod_1 = require("zod");
const createContactSupportZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        sub: zod_1.z.string({ required_error: 'Subject is required' }),
        msg: zod_1.z.string({ required_error: 'Message is required' }),
    }),
});
const updateContactSupportZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        reply: zod_1.z.string({ required_error: 'Reply is required' }),
    }),
});
exports.ContactSupportValidation = {
    createContactSupportZodSchema,
    updateContactSupportZodSchema,
};
