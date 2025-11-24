"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactSupportModel = void 0;
const mongoose_1 = require("mongoose");
const subCategorySchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sub: {
        type: String,
        required: true,
    },
    msg: {
        type: String,
        required: true,
    },
    reply: {
        type: String,
        default: null,
    },
    isReply: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
exports.ContactSupportModel = (0, mongoose_1.model)('ContactSupport', subCategorySchema);
