"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubCategoryRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const subCategory_controller_1 = require("./subCategory.controller");
const subCategory_validation_1 = require("./subCategory.validation");
const router = express_1.default.Router();
router
    .route('/')
    .get(subCategory_controller_1.SubCategoryController.getSubCategories)
    .post((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), (0, validateRequest_1.default)(subCategory_validation_1.SubCategoryValidation.createSubCategoryZodSchema), subCategory_controller_1.SubCategoryController.createSubCategory);
router
    .route('/:id')
    .get(subCategory_controller_1.SubCategoryController.getSubCategory)
    .delete((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), subCategory_controller_1.SubCategoryController.deleteSubCategory)
    .patch((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), (0, validateRequest_1.default)(subCategory_validation_1.SubCategoryValidation.updateSubCategoryZodSchema), subCategory_controller_1.SubCategoryController.updateSubCategory);
exports.SubCategoryRoutes = router;
