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
exports.MessageController = void 0;
const message_service_1 = require("./message.service");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const getFilePath_1 = require("../../../shared/getFilePath");
// create message
const createMessage = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const image = (0, getFilePath_1.getSingleFilePath)(req.files, 'image');
    const payload = Object.assign(Object.assign({}, req.body), { sender: req.user.id, image });
    const result = yield message_service_1.MessageServices.createMessage(payload);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Message created successfully',
        data: result,
    });
}));
// get messages by chat id
const getChatMessages = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield message_service_1.MessageServices.getChatMessages(req.params.id, req.query, req.user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Messages retrieved successfully',
        data: result === null || result === void 0 ? void 0 : result.messages,
        pagination: result === null || result === void 0 ? void 0 : result.pagination,
    });
}));
// get messages by chat id
const getUnreadMessagesAmount = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield message_service_1.MessageServices.getUnreadMessagesAmount(req.user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Messages amount retrieved successfully',
        data: result === null || result === void 0 ? void 0 : result.data,
    });
}));
exports.MessageController = { createMessage, getChatMessages, getUnreadMessagesAmount };
