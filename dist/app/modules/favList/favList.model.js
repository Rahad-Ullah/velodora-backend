"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavListModel = void 0;
const mongoose_1 = require("mongoose");
const subCategorySchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    providerIds: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'Provider',
        required: true,
    }
}, { timestamps: true });
exports.FavListModel = (0, mongoose_1.model)('FavList', subCategorySchema);
