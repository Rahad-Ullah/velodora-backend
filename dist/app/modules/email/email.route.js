"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailRoutes = void 0;
const express_1 = __importDefault(require("express"));
const email_controller_1 = require("./email.controller");
const router = express_1.default.Router();
router
    .route('/send-email')
    .post(
// auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
email_controller_1.EmailController.SendEmail);
exports.EmailRoutes = router;
