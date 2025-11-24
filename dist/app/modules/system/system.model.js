"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemModel = void 0;
const mongoose_1 = require("mongoose");
const systemSchema = new mongoose_1.Schema({
    oneRsdToCredits: {
        type: Number,
        default: 1,
    },
    penaltyTime: {
        type: Number,
        default: 1,
    },
    weatherFee: {
        amount: {
            type: Number,
            default: 0,
        },
        isOn: {
            type: Boolean,
            default: false,
        }
    },
    convenienceFee: {
        amount: {
            type: Number,
            default: 0,
        },
        isOn: {
            type: Boolean,
            default: false,
        }
    },
    arrivalFee: {
        amount: {
            type: Number,
            default: 0,
        },
        isOn: {
            type: Boolean,
            default: false,
        }
    },
}, { timestamps: true });
exports.SystemModel = (0, mongoose_1.model)('System', systemSchema);
