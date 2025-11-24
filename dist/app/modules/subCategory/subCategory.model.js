"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubCategoryModel = void 0;
const mongoose_1 = require("mongoose");
const subCategorySchema = new mongoose_1.Schema({
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    name: {
        type: String,
        required: true,
    }
}, { timestamps: true });
exports.SubCategoryModel = (0, mongoose_1.model)('Subcategory', subCategorySchema);
