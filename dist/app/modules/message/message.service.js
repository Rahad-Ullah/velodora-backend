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
exports.MessageServices = exports.getUnreadMessagesAmount = exports.getChatMessages = void 0;
const chat_model_1 = require("../chat/chat.model");
const message_model_1 = require("./message.model");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const message_constants_1 = require("./message.constants");
const notification_constants_1 = require("../notification/notification.constants");
const mongoose_1 = require("mongoose");
const notificationHelper_1 = require("../../../helpers/notificationHelper");
// ----------------- create message service ---------------
const createMessage = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // check if the chat exists and the sender is a participant
    const isChatExist = yield chat_model_1.ChatModel.findOne({
        _id: payload.chat,
        isDeleted: false,
        participants: { $in: [payload.sender] },
    });
    if (!isChatExist)
        throw new Error('ChatModel not found or deleted');
    const result = yield message_model_1.MessageModel.create(payload);
    if (!result) {
        throw new ApiError_1.default(400, 'Failed to create message');
    }
    ;
    const msgResponse = yield message_model_1.MessageModel.findById(result._id).populate('sender', { role: 1, name: 1, image: 1 });
    if (!msgResponse)
        throw new ApiError_1.default(400, 'Failed to get message');
    // emit socket event for new message
    const io = global.io;
    if (io) {
        io.emit(`getMessage::${payload.chat}`, msgResponse);
    }
    // Find the receiver(s): all participants except the sender
    const receivers = isChatExist.participants.filter((participantId) => participantId.toString() !== payload.sender.toString());
    // notify the receiver(s) for attachment //
    if (payload.type === message_constants_1.MESSAGE_TYPE.IMAGE || payload.type === message_constants_1.MESSAGE_TYPE.TEXT) {
        yield Promise.all(receivers.map((receiverId) => (0, notificationHelper_1.sendNotifications)({
            type: notification_constants_1.NOTIFICATION_TYPE.MESSAGE,
            title: 'You have received an new message',
            receiver: receiverId,
            referenceId: result._id,
        })));
    }
    // update the chat to sort it to the top
    yield chat_model_1.ChatModel.findByIdAndUpdate(payload.chat, {});
    return result;
});
// ----------------- get messages by chat id -------------------
const getChatMessages = (chatId, query, user) => __awaiter(void 0, void 0, void 0, function* () {
    // check if the chat exists
    const existingChat = yield chat_model_1.ChatModel.findById(chatId);
    if (!existingChat)
        throw new ApiError_1.default(401, 'Chat not found');
    // get another participant
    const anotherParticipant = existingChat.participants.filter(participant => participant.toString() !== (user === null || user === void 0 ? void 0 : user.id))[0];
    // update seen status those are seen by the user right now
    yield message_model_1.MessageModel.updateMany({ chat: chatId, seenBy: { $nin: [user === null || user === void 0 ? void 0 : user.id] } }, { $addToSet: { seenBy: user === null || user === void 0 ? void 0 : user.id } });
    const messageQuery = new QueryBuilder_1.default(message_model_1.MessageModel.find({ chat: chatId }), query)
        .populate(['sender'], { sender: { role: 1, name: 1, email: 1 } })
        .sort(['-createdAt'])
        .paginate()
        .search(['text'])
        .filter();
    const [messages, pagination] = yield Promise.all([
        messageQuery.modelQuery.lean(),
        messageQuery.getPaginationInfo(),
    ]);
    // add seen status to messages
    const messagesWithStatus = messages.map((message) => {
        return Object.assign(Object.assign({}, message), { isSeen: message.seenBy
                .map((id) => id.toString())
                .includes(anotherParticipant.toString()) });
    });
    return { messages: messagesWithStatus, pagination };
});
exports.getChatMessages = getChatMessages;
// ----------------- get messages by chat id -------------------
const getUnreadMessagesAmount = (user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log(user);
    const userId = new mongoose_1.Types.ObjectId(user === null || user === void 0 ? void 0 : user.id);
    const chats = yield chat_model_1.ChatModel.aggregate([
        {
            $match: {
                isDeleted: false,
                participants: { $in: [userId] }
            }
        },
        {
            $project: {
                _id: 1
            }
        }
    ]);
    const chatList = chats.map((chat) => chat._id);
    const unreadMessageCount = yield message_model_1.MessageModel.aggregate([
        {
            $match: {
                chat: { $in: chats.map((chat) => chat._id) },
                sender: { $ne: userId },
                seenBy: { $nin: [userId] },
            },
        },
        {
            $group: {
                _id: "$chat", // Group by the chat ID
            },
        },
        {
            $count: "distinctChats" // Count the number of distinct chats
        }
    ]);
    console.log((_a = unreadMessageCount[0]) === null || _a === void 0 ? void 0 : _a.distinctChats);
    // return { data: { chats: chatList, unreadMessage: unreadMessageCount[0]?.distinctChats || 0 } };
    return { data: ((_b = unreadMessageCount[0]) === null || _b === void 0 ? void 0 : _b.distinctChats) || 0 };
});
exports.getUnreadMessagesAmount = getUnreadMessagesAmount;
exports.MessageServices = { createMessage, getChatMessages: exports.getChatMessages, getUnreadMessagesAmount: exports.getUnreadMessagesAmount };
