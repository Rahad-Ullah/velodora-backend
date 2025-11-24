"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const review_controller_1 = require("./review.controller");
const review_validation_1 = require("./review.validation");
const router = express_1.default.Router();
router
    .route('/')
    .post((0, auth_1.default)(user_1.USER_ROLES.USER), (0, validateRequest_1.default)(review_validation_1.ReviewValidation.reviewZodSchema), review_controller_1.ReviewController.createReview)
    .get((0, auth_1.default)(user_1.USER_ROLES.PROVIDER), review_controller_1.ReviewController.getMyReviews);
router
    .route('/my-ratings')
    .get((0, auth_1.default)(user_1.USER_ROLES.PROVIDER), review_controller_1.ReviewController.getMyRatings);
router
    .route('/:id')
    .get((0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.PROVIDER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), review_controller_1.ReviewController.getProviderReviews);
exports.ReviewRoutes = router;
