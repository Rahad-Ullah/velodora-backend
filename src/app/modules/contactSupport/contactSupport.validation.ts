import { z } from 'zod';

const createContactSupportZodSchema = z.object({
  body: z.object({
    sub: z.string({ required_error: 'Subject is required' }),
    msg: z.string({ required_error: 'Message is required' }),
  }),
});

const updateContactSupportZodSchema = z.object({
  body: z.object({
    reply: z.string({ required_error: 'Reply is required' }),
  }),
});

export const ContactSupportValidation = {
  createContactSupportZodSchema,
  updateContactSupportZodSchema,
};