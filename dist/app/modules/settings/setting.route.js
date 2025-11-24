"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsRouter = void 0;
const express_1 = __importDefault(require("express"));
const settings_controller_1 = require("./settings.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
router
    .post('/', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), settings_controller_1.settingsController.addSetting)
    .get('/:title', settings_controller_1.settingsController.getSettings)
    .patch('/', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), settings_controller_1.settingsController.updateSetting);
exports.settingsRouter = router;
