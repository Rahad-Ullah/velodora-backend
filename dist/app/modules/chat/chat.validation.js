"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatValidations = void 0;
const zod_1 = require("zod");
// create chat schema
const createChatZodSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        participants: zod_1.z
            .array(zod_1.z.string({ required_error: 'Participants is required' }))
            .nonempty('Participants cannot be empty')
            .min(1, 'At least 1 participants are required'),
    })
        .strict('Unnecessary fields are not allowed'),
});
exports.ChatValidations = { createChatZodSchema };
