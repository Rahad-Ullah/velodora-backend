"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralModel = void 0;
const mongoose_1 = require("mongoose");
const referralSchema = new mongoose_1.Schema({
    code: { type: String, required: true, unique: true },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    usedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    isUsed: { type: Boolean, default: false },
}, {
    timestamps: true,
});
exports.ReferralModel = (0, mongoose_1.model)('Referral', referralSchema);
