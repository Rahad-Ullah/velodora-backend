"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
const category_controller_1 = require("./category.controller");
const category_validation_1 = require("./category.validation");
const router = express_1.default.Router();
router
    .route('/')
    .get(category_controller_1.CategoryController.getCategories)
    .post((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), (0, fileUploadHandler_1.default)(), (req, res, next) => {
    if (req.body.data) {
        req.body = category_validation_1.CategoryValidation.updateCategoryZodSchema.parse(JSON.parse(req.body.data));
    }
    return category_controller_1.CategoryController.createCategory(req, res, next);
});
router
    .route('/:id')
    .get(category_controller_1.CategoryController.getCategory)
    .delete((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), category_controller_1.CategoryController.deleteCategory)
    .patch((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), (0, fileUploadHandler_1.default)(), (req, res, next) => {
    if (req.body.data) {
        req.body = category_validation_1.CategoryValidation.updateCategoryZodSchema.parse(JSON.parse(req.body.data));
    }
    return category_controller_1.CategoryController.updateCategory(req, res, next);
});
exports.CategoryRoutes = router;
