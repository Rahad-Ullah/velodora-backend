import { z } from 'zod';


// create provider sod schema
const createProviderZodSchema = z.object({
  data: z.object({
    aboutMe: z.string({ required_error: 'About me is required' }),
    serviceLanguage: z.array(z.string({ required_error: 'Service language is required' })),
    primaryLocation: z.string({ required_error: 'Location is required' }),
    serviceDistance: z.number({ required_error: 'Service distance is required' }),
    pricePerHour: z.number({ required_error: 'Price per hour is required' }),
    isRead: z.boolean({ required_error: 'Read is required' })
  }),
  services: z.array(z.object({
    category: z.string({ required_error: 'Category is required' }),
    subCategory: z.string({ required_error: 'Sub category is required' }),
    price: z.number({ required_error: 'Price is required' }),
  })),
  serviceImages: z.array(z.string(), { required_error: 'Service images are required' }).max(4, 'You can upload up to 4 images'),
});


// update provider sod schema
const updateProviderZodSchema = z.object({
  data: z.object({
    aboutMe: z.string().optional(),
    serviceLanguage: z.array(z.string()).optional(),
    primaryLocation: z.string().optional(),
    serviceDistance: z.number().optional(),
    pricePerHour: z.number().optional(),
  }).optional(),
  services: z.object({
    new: z.array(z.object({
      category: z.string({ required_error: 'Category is required' }),
      subCategory: z.string({ required_error: 'Sub category is required' }),
      price: z.number({ required_error: 'Price is required' }),
    })).optional(),
    update: z.array(z.object({
      ref: z.string({ required_error: 'Id is required' }),
      category: z.string({ required_error: 'Category is required' }),
      subCategory: z.string({ required_error: 'Sub category is required' }),
      price: z.number({ required_error: 'Price is required' }),
    })).optional()
  }).optional(),
  serviceImages: z.array(z.string()).optional(),
  previousServiceImages: z.array(z.string()).optional()
}).optional();

export const ProviderValidation = {
  createProviderZodSchema,
  updateProviderZodSchema,
};