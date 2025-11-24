"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubCategoryController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const subCategory_service_1 = require("./subCategory.service");
//create sub category controller
const createSubCategory = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield subCategory_service_1.SubCategoryService.createSubCategoryToDB(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result.data,
    });
}));
//get single sub category controller
const getSubCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield subCategory_service_1.SubCategoryService.getSubCategoryFromDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Sub Category data retrieved successfully',
        data: result.data,
    });
}));
//get all categories controller
const getSubCategories = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Call service
    const { data } = yield subCategory_service_1.SubCategoryService.getSubCategoriesFromDB(req.query);
    // Send response
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Sub Categories data retrieved successfully',
        data: data || [],
    });
}));
//update category
const updateSubCategory = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
    const result = yield subCategory_service_1.SubCategoryService.updateSubCategoryToDB(req.body, id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result.message,
        data: result.res,
    });
}));
//delete category
const deleteSubCategory = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
    const result = yield subCategory_service_1.SubCategoryService.deleteSubCategoryToDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Profile updated successfully',
        data: result,
    });
}));
exports.SubCategoryController = { createSubCategory, getSubCategory, getSubCategories, updateSubCategory, deleteSubCategory };
