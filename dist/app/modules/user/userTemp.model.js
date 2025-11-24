"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTempModel = void 0;
const mongoose_1 = require("mongoose");
const userTempSchema = new mongoose_1.Schema({
    ref: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    name: {
        type: String,
    },
    image: {
        type: String,
        default: null,
    },
    email: {
        type: String,
    },
    contact: {
        type: String,
    },
    countryCode: {
        type: String,
    },
    location: {
        type: String,
    },
}, { timestamps: true });
exports.UserTempModel = (0, mongoose_1.model)('UserTemp', userTempSchema);
