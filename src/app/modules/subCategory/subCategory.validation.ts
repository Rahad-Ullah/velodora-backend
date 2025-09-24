import { z } from 'zod';

const createSubCategoryZodSchema = z.object({
  body: z.object({
    category: z.string({ required_error: 'Category is required'}),
    name: z.string({ required_error: 'Sub Category name is required' }),
  }),
});

const updateSubCategoryZodSchema = z.object({
  category: z.string().optional(),
  name: z.string().optional(),
});

export const SubCategoryValidation = {
  createSubCategoryZodSchema,
  updateSubCategoryZodSchema,
};