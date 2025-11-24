"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoCodeModel = void 0;
const mongoose_1 = require("mongoose");
const promoCodeSchema = new mongoose_1.Schema({
    code: { type: String, required: true, unique: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    limits: { type: Number, required: true },
    discount: { type: Number, required: true },
}, {
    timestamps: true,
});
exports.PromoCodeModel = (0, mongoose_1.model)('PromoCode', promoCodeSchema);
