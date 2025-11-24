"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceModel = void 0;
const mongoose_1 = require("mongoose");
const service_1 = require("../../../enums/service");
const serviceSchema = new mongoose_1.Schema({
    ref: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'service',
    },
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    subCategory: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(service_1.SERVICE_STATUS),
        default: service_1.SERVICE_STATUS.OLD
    }
}, { timestamps: true });
exports.ServiceModel = (0, mongoose_1.model)('service', serviceSchema);
