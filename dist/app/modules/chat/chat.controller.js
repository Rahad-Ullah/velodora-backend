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
exports.ChatController = void 0;
const chat_service_1 = require("./chat.service");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = __importDefault(require("mongoose"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
// create chat
const createChat = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = Object.assign({}, req.body);
    const result = yield chat_service_1.ChatServices.createChatIntoDB(req.user.id, payload);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Chat created successfully',
        data: result,
    });
}));
// delete chat
const deleteChat = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const result = yield chat_service_1.ChatServices.deleteChatFromDB(req.params.id, { session });
        yield session.commitTransaction();
        session.endSession();
        (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_codes_1.StatusCodes.OK,
            message: 'Chat deleted successfully',
            data: result,
        });
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete chat!');
    }
}));
// get my chats
const getMyChats = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield chat_service_1.ChatServices.getChatsByIdFromDB(req.user.id, req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Chats retrieved successfully',
        data: result,
    });
}));
exports.ChatController = { createChat, deleteChat, getMyChats };
