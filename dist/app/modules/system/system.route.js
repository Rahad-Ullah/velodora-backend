"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemRoutes = void 0;
const express_1 = __importDefault(require("express"));
const system_controller_1 = require("./system.controller");
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
router
    .route('/')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.USER, user_1.USER_ROLES.PROVIDER), system_controller_1.SystemController.getSystem)
    .post((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), system_controller_1.SystemController.createSystem)
    .patch((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), system_controller_1.SystemController.updateSystem);
router
    .route('/:type')
    .patch((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), system_controller_1.SystemController.onOffSystem);
exports.SystemRoutes = router;
