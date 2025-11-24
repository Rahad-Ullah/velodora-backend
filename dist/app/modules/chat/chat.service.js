"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatServices = void 0;
const chat_model_1 = require("./chat.model");
const message_model_1 = require("../message/message.model");
const unlinkFile_1 = require("../../../shared/unlinkFile");
const message_constants_1 = require("../message/message.constants");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_codes_1 = require("http-status-codes");
// ---------------- create chat service --------------- //
const createChatIntoDB = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const participants = [...payload.participants];
    if (!participants.includes(userId)) {
        participants.push(userId);
    }
    const isExist = yield chat_model_1.ChatModel.findOne({
        participants: { $all: participants },
        isDeleted: false,
    }).session(payload.session);
    if (isExist) {
        return isExist;
    }
    // ✅ Use array form for session support
    const [result] = yield chat_model_1.ChatModel.create([{ participants }], { session: payload.session });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create chat');
    }
    return result;
});
// ---------------- delete chat service ---------------- //
const deleteChatFromDB = (chatId, options) => __awaiter(void 0, void 0, void 0, function* () {
    const session = options === null || options === void 0 ? void 0 : options.session;
    const isExist = yield chat_model_1.ChatModel.findById(chatId).session(session);
    if (!isExist) {
        throw new Error('ChatModel not found');
    }
    const result = yield chat_model_1.ChatModel.findByIdAndDelete(chatId).session(session);
    const messages = yield message_model_1.MessageModel.find({ chat: chatId }).session(session);
    if (messages.length > 0) {
        yield message_model_1.MessageModel.deleteMany({ chat: chatId }).session(session);
        messages.forEach((message) => {
            if (message.type === message_constants_1.MESSAGE_TYPE.IMAGE && (message === null || message === void 0 ? void 0 : message.image)) {
                (0, unlinkFile_1.unlinkFile)(message.image);
            }
        });
    }
    return result;
});
// ---------------- get chats by user id service ---------------- //
const getChatsByIdFromDB = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const chats = yield chat_model_1.ChatModel.find({ participants: { $in: [userId] } })
        .populate({
        path: 'participants',
        select: 'name email role image',
        match: Object.assign({ 
            // isDeleted: false,
            _id: { $ne: userId } }, ((query === null || query === void 0 ? void 0 : query.searchTerm) && {
            $or: [
                { name: { $regex: query.searchTerm, $options: 'i' } },
            ],
        })), // Apply $regex only if search is valid },
    })
        .select('participants updatedAt')
        .sort('-updatedAt');
    // Filter out chats where no participants match the search (empty participants)
    const filteredChats = chats === null || chats === void 0 ? void 0 : chats.filter((chat) => { var _a; return ((_a = chat === null || chat === void 0 ? void 0 : chat.participants) === null || _a === void 0 ? void 0 : _a.length) > 0; });
    //Use Promise.all to get the last message for each chat
    const chatList = yield Promise.all(filteredChats === null || filteredChats === void 0 ? void 0 : filteredChats.map((chat) => __awaiter(void 0, void 0, void 0, function* () {
        const chatData = chat === null || chat === void 0 ? void 0 : chat.toObject();
        const lastMessage = yield message_model_1.MessageModel.findOne({
            chat: chat === null || chat === void 0 ? void 0 : chat._id,
        })
            .sort({ createdAt: -1 })
            .select('text image type sender')
            .populate('sender', 'name role image');
        // find unread messages count
        const unreadCount = yield message_model_1.MessageModel.countDocuments({
            chat: chat === null || chat === void 0 ? void 0 : chat._id,
            seenBy: { $nin: [userId] },
        });
        return Object.assign(Object.assign({}, chatData), { participants: chatData.participants, unreadCount: unreadCount || 0, lastMessage: lastMessage || null });
    })));
    return chatList;
});
exports.ChatServices = {
    createChatIntoDB,
    deleteChatFromDB,
    getChatsByIdFromDB,
};
