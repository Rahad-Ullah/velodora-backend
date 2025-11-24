"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderModel = void 0;
const mongoose_1 = require("mongoose");
const providerSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    aboutMe: {
        type: String,
        required: true,
    },
    services: {
        type: [mongoose_1.Schema.Types.ObjectId],
        required: true,
    },
    serviceLanguage: {
        type: [String],
        required: true,
    },
    primaryLocation: {
        type: String,
        required: true,
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        },
    },
    serviceDistance: {
        type: Number,
        // required: true,
    },
    pricePerHour: {
        type: Number,
        required: true,
    },
    serviceImages: {
        type: [String],
        max: 10,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    isOnline: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });
providerSchema.index({ location: "2dsphere" });
exports.ProviderModel = (0, mongoose_1.model)('Provider', providerSchema);
