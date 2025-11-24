"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
const mongoose_1 = require("mongoose");
const notification_constants_1 = require("./notification.constants");
const notificationSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: Object.values(notification_constants_1.NOTIFICATION_TYPE),
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    receiver: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    referenceId: {
        type: mongoose_1.Schema.Types.ObjectId,
        default: null,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
exports.NotificationModel = (0, mongoose_1.model)('Notification', notificationSchema);
