"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRoutes = void 0;
const express_1 = __importDefault(require("express"));
const message_controller_1 = require("./message.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const message_validation_1 = require("./message.validation");
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
// create message
router.post('/create', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.USER, user_1.USER_ROLES.PROVIDER), (0, fileUploadHandler_1.default)(), (0, validateRequest_1.default)(message_validation_1.MessageValidations.createMessageZodSchema), message_controller_1.MessageController.createMessage);
// get chat messages
router.get('/get-unread-messages-amount', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.USER, user_1.USER_ROLES.PROVIDER), message_controller_1.MessageController.getUnreadMessagesAmount);
// get chat messages
router.get('/:id', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.USER, user_1.USER_ROLES.PROVIDER), message_controller_1.MessageController.getChatMessages);
exports.MessageRoutes = router;
