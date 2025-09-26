import { z } from 'zod';

const createScheduleZodSchema = z.object({
  data: z.object({
    provider: z.string({ required_error: 'Provider is required' }),
    date: z.string({ required_error: 'About me is required' }),
    startTime:z.string({required_error: 'Start Time is required'}),
    endTime:z.string({required_error: 'Start Time is required'}),
    duration:z.number({required_error: 'Duration is required'})
  })
});

const updateScheduleZodSchema = z.object({
  data: z.object({
    provider: z.string({ required_error: 'Provider is required for schedule' }),
    date: z.string({ required_error: 'About me is required' }),
    startTime:z.string({required_error: 'Start Time is required'}),
    endTime:z.string({required_error: 'Start Time is required'}),
    duration:z.number({required_error: 'Duration is required'})
  })
});

export const ServiceValidation = {
  createScheduleZodSchema,
  updateScheduleZodSchema,
};
