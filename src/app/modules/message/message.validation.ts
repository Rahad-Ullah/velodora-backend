import { z } from 'zod';
import { MESSAGE_TYPE } from './message.constants';

// create message schema
const createMessageZodSchema = z.object({
  body: z
    .object({
      chat: z
        .string({ required_error: 'Chat is required' })
        .nonempty('Chat cannot be empty'),
      type: z.nativeEnum(MESSAGE_TYPE),
      text: z.string().optional(),
      image: z.string().url().optional(),
    })
    .strict('Unnecessary fields found'),
});

export const MessageValidations = { createMessageZodSchema };
