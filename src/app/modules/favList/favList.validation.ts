import { z } from 'zod';

const favListZodSchema = z.object({
  body: z.object({
    providerId: z.string({ required_error: 'Provider ID is required'})
  }),
});

export const FavListValidation = {
  favListZodSchema
};