"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const notification_controller_1 = require("./notification.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
// get my notifications
router.get('/', (0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.PROVIDER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), notification_controller_1.NotificationController.getMyNotification);
// read my notifications
router.patch('/read', (0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.PROVIDER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), notification_controller_1.NotificationController.readMyNotifications);
// get my notifications amount
router.get('/amount', (0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.PROVIDER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), notification_controller_1.NotificationController.getUserNotificationAmount);
exports.NotificationRoutes = router;
