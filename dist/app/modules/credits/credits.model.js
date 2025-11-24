"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditsModel = void 0;
const mongoose_1 = require("mongoose");
const creditsSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    credits: {
        type: Number,
        required: true,
    }
}, { timestamps: true });
exports.CreditsModel = (0, mongoose_1.model)('Credits', creditsSchema);
