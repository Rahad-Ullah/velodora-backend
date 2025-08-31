import { z } from 'zod';

const createCategoryZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Category name is required' }),
    icon: z.string({ required_error: 'Category icon is required'}),
  }),
});

const updateCategoryZodSchema = z.object({
  name: z.string().optional(),
  icon: z.string().optional(),
});

export const CategoryValidation = {
  createCategoryZodSchema,
  updateCategoryZodSchema,
};