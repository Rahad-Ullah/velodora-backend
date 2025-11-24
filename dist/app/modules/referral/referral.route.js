"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const referral_controller_1 = require("./referral.controller");
const router = express_1.default.Router();
router.get('/referralCode', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), referral_controller_1.ReferralController.getReferralCode);
router.delete('/deleteReferralCode/:referralCodeId', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), referral_controller_1.ReferralController.deleteReferralCode);
router.get('/referralList', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), referral_controller_1.ReferralController.getReferralsList);
exports.ReferralRoutes = router;
