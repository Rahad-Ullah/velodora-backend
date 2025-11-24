"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingValidation = void 0;
const zod_1 = require("zod");
const createBookingZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        provider: zod_1.z.string({ required_error: 'Provider is required' }),
        services: zod_1.z.array(zod_1.z.string({ required_error: 'Services is required' })).min(1, 'At least one service is required'),
        date: zod_1.z.string({ required_error: 'Date is required' }).refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
        slots: zod_1.z.array(zod_1.z.object({
            start: zod_1.z.string({ required_error: 'Start Time is required' }),
            end: zod_1.z.string({ required_error: 'End Time is required' }),
        })).min(1, 'At least one slot is required'),
        amount: zod_1.z.coerce.number({ required_error: 'Amount is required' }),
        subTotal: zod_1.z.coerce.number({ required_error: 'SubTotal is required' }),
        promoCode: zod_1.z.string().optional(),
        weatherFee: zod_1.z.number().optional(),
        convenienceFee: zod_1.z.number().optional(),
        arrivalFee: zod_1.z.number().optional(),
        discount: zod_1.z.number().optional(),
    }),
});
exports.BookingValidation = {
    createBookingZodSchema,
};
