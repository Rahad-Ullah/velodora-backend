"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoCodeRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const promoCode_controller_1 = require("./promoCode.controller");
const router = express_1.default.Router();
router
    .route('/')
    .post((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), promoCode_controller_1.PromoCodeController.createPromoCode)
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), promoCode_controller_1.PromoCodeController.getPromoCodes);
router
    .route('/:code')
    .get(
// auth(USER_ROLES.USER),
promoCode_controller_1.PromoCodeController.getPromoCode)
    .delete((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), promoCode_controller_1.PromoCodeController.deletePromoCode);
exports.PromoCodeRoutes = router;
