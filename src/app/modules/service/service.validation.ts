import { z } from 'zod';

const createServiceZodSchema = z.object({
  data: z.object({
    aboutMe: z.string({ required_error: 'About me is required' }),
    serviceType: z.string({ required_error: 'Service type is required' }),
    additionalServiceType: z.string({ required_error: 'Additional service type is required' }),
    serviceLocation: z.string({ required_error: 'Location is required' }),
    serviceDistance: z.number({ required_error: 'Service distance is required' }),
    price: z.number({ required_error: 'Price is required' }),
    pricePerHour: z.number({ required_error: 'Price per hour is required' }),
    read: z.boolean({ required_error: 'Read is required' }),
    status: z.string().optional(),
    isOnline: z.boolean().optional(),
  }),
  serviceImages: z.array(z.string(), { required_error: 'Service images are required' }).max(4, 'You can upload up to 4 images'),
});

const updateUserZodSchema = z.object({
  data: z.object({
    aboutMe: z.string().optional(),
    serviceType: z.string().optional(),
    additionalServiceType: z.string().optional(),
    serviceLocation: z.string().optional(),
    serviceDistance: z.number().optional(),
    price: z.number().optional(),
    pricePerHour: z.number().optional(),
    read: z.boolean().optional(),
    status: z.string().optional(),
    isOnline: z.boolean().optional(),
  }),
  serviceImages: z.array(z.string()).optional()
});

export const ServiceValidation = {
  createServiceZodSchema,
  updateUserZodSchema,
};
