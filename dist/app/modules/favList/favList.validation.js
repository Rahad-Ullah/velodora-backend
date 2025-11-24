"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavListValidation = void 0;
const zod_1 = require("zod");
const favListZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        providerId: zod_1.z.string({ required_error: 'Provider ID is required' })
    }),
});
exports.FavListValidation = {
    favListZodSchema
};
