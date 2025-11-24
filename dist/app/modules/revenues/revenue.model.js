"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueModel = void 0;
const mongoose_1 = require("mongoose");
const revenueSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    revenue: {
        type: Number,
        required: true,
    }
}, { timestamps: true });
exports.RevenueModel = (0, mongoose_1.model)('Revenue', revenueSchema);
