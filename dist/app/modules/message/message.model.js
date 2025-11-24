"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModel = void 0;
const mongoose_1 = require("mongoose");
const message_constants_1 = require("./message.constants");
const messageSchema = new mongoose_1.Schema({
    chat: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
    },
    sender: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: Object.values(message_constants_1.MESSAGE_TYPE),
        required: true,
    },
    text: {
        type: String,
    },
    image: {
        type: String,
    },
    seenBy: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'User',
        default: [],
    },
}, {
    timestamps: true,
});
exports.MessageModel = (0, mongoose_1.model)('Message', messageSchema);
