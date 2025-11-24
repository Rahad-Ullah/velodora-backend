"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageValidations = void 0;
const zod_1 = require("zod");
const message_constants_1 = require("./message.constants");
// create message schema
const createMessageZodSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        chat: zod_1.z
            .string({ required_error: 'Chat is required' })
            .nonempty('Chat cannot be empty'),
        type: zod_1.z.nativeEnum(message_constants_1.MESSAGE_TYPE),
        text: zod_1.z.string().optional(),
        image: zod_1.z.string().url().optional(),
    })
        .strict('Unnecessary fields found'),
});
exports.MessageValidations = { createMessageZodSchema };
