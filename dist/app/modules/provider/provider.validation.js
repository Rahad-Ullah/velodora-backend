"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderValidation = void 0;
const zod_1 = require("zod");
// create provider sod schema
const createProviderZodSchema = zod_1.z.object({
    data: zod_1.z.object({
        aboutMe: zod_1.z.string({ required_error: 'About me is required' }),
        serviceLanguage: zod_1.z.array(zod_1.z.string({ required_error: 'Service language is required' })),
        primaryLocation: zod_1.z.string({ required_error: 'Location is required' }),
        location: zod_1.z.object({
            type: zod_1.z.string({ required_error: 'Location type is required' }),
            coordinates: zod_1.z.array(zod_1.z.number({ required_error: 'Coordinates are required' })),
        }),
        serviceDistance: zod_1.z.number({ required_error: 'Service distance is required' }),
        pricePerHour: zod_1.z.number({ required_error: 'Price per hour is required' }),
        isRead: zod_1.z.boolean({ required_error: 'Read is required' })
    }),
    services: zod_1.z.array(zod_1.z.object({
        category: zod_1.z.string({ required_error: 'Category is required' }),
        subCategory: zod_1.z.string({ required_error: 'Sub category is required' }),
        price: zod_1.z.number({ required_error: 'Price is required' }),
    })),
    serviceImages: zod_1.z.array(zod_1.z.string(), { required_error: 'Service images are required' }).max(4, 'You can upload up to 4 images'),
});
// update provider sod schema
const updateProviderZodSchema = zod_1.z.object({
    data: zod_1.z.object({
        aboutMe: zod_1.z.string({ required_error: 'About me is required' }),
        serviceLanguage: zod_1.z.array(zod_1.z.string({ required_error: 'Service language is required' })),
        primaryLocation: zod_1.z.string({ required_error: 'Location is required' }),
        location: zod_1.z.object({
            type: zod_1.z.string({ required_error: 'Location type is required' }),
            coordinates: zod_1.z.array(zod_1.z.number({ required_error: 'Coordinates are required' })),
        }),
        serviceDistance: zod_1.z.number({ required_error: 'Service distance is required' }),
        pricePerHour: zod_1.z.number({ required_error: 'Price per hour is required' }),
        isRead: zod_1.z.boolean({ required_error: 'Read is required' })
    }),
    services: zod_1.z.object({
        new: zod_1.z.array(zod_1.z.object({
            category: zod_1.z.string({ required_error: 'Category is required' }),
            subCategory: zod_1.z.string({ required_error: 'Sub category is required' }),
            price: zod_1.z.number({ required_error: 'Price is required' }),
        })).optional(),
        update: zod_1.z.array(zod_1.z.object({
            ref: zod_1.z.string({ required_error: 'Id is required' }),
            category: zod_1.z.string({ required_error: 'Category is required' }),
            subCategory: zod_1.z.string({ required_error: 'Sub category is required' }),
            price: zod_1.z.number({ required_error: 'Price is required' }),
        })).optional()
    }).optional(),
    serviceImages: zod_1.z.array(zod_1.z.string()).optional(),
    previousServiceImages: zod_1.z.array(zod_1.z.string()).optional()
}).optional();
exports.ProviderValidation = {
    createProviderZodSchema,
    updateProviderZodSchema,
};
