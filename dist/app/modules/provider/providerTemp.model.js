"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderTempModel = void 0;
const mongoose_1 = require("mongoose");
const providerTempSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    ref: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Provider',
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
        default: false,
    }
}, { timestamps: true });
providerTempSchema.index({ location: "2dsphere" });
exports.ProviderTempModel = (0, mongoose_1.model)('ProviderTemp', providerTempSchema);
