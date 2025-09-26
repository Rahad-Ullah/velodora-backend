import { z } from 'zod';

const createBookingZodSchema = z.object({
  data: z.object({
    user: z.string({ required_error: 'User is required' }),
    provider: z.string({ required_error: 'Provider is required' }),
    services: z.array(z.string({ required_error: 'Services is required' })),
    date: z.string({ required_error: 'Date is required' }),
    slots: z.array(z.object({
      start:z.string({required_error: 'Start Time is required'}),
      end:z.string({required_error: 'End Time is required'}),
    })),
    amount:z.number({required_error: 'Amount is required'}),
    paymentId:z.string({required_error: 'Payment ID is required'}),
    status:z.string({required_error: 'Status is required'}),
  })
});

export const BookingValidation = {
  createBookingZodSchema
};
