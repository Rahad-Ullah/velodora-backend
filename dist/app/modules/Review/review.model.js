"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewModel = void 0;
const mongoose_1 = require("mongoose");
const reviewSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    providerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
}, { timestamps: true });
exports.ReviewModel = (0, mongoose_1.model)('Review', reviewSchema);
