import { z } from 'zod';

const createBookingZodSchema = z.object({
  body: z.object({
    provider: z.string({ required_error: 'Provider is required' }),
    services: z.array(z.string({ required_error: 'Services is required' })).min(1, 'At least one service is required'),
    date: z.string({ required_error: 'Date is required' }).refine(
      (val) => !isNaN(Date.parse(val)),
      { message: 'Invalid date format' }
    ),
    slots: z.array(
      z.object({
        start: z.string({ required_error: 'Start Time is required' }),
        end: z.string({ required_error: 'End Time is required' }),
      })
    ).min(1, 'At least one slot is required'),
    amount: z.coerce.number({ required_error: 'Amount is required' }),
  }),
});

export const BookingValidation = {
  createBookingZodSchema,
};
