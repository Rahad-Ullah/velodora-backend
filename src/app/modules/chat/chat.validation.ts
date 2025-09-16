import { z } from 'zod';

// create chat schema
const createChatZodSchema = z.object({
  body: z
    .object({
      participants: z
        .array(z.string({ required_error: 'Participants is required' }))
        .nonempty('Participants cannot be empty')
        .min(1, 'At least 1 participants are required'),
    })
    .strict('Unnecessary fields are not allowed'),
});

export const ChatValidations = { createChatZodSchema };
