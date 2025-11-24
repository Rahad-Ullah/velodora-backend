"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRoutes = void 0;
const express_1 = __importDefault(require("express"));
const chat_controller_1 = require("./chat.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const chat_validation_1 = require("./chat.validation");
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
// create chat
router.post('/create', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.USER, user_1.USER_ROLES.PROVIDER), (0, validateRequest_1.default)(chat_validation_1.ChatValidations.createChatZodSchema), chat_controller_1.ChatController.createChat);
// delete chat
router.delete('/:id', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.USER, user_1.USER_ROLES.PROVIDER), chat_controller_1.ChatController.deleteChat);
// get my chats
router.get('/my-chats', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.USER, user_1.USER_ROLES.PROVIDER), chat_controller_1.ChatController.getMyChats);
exports.ChatRoutes = router;
