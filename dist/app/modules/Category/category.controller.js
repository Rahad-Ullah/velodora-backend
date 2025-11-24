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
exports.CategoryController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const getFilePath_1 = require("../../../shared/getFilePath");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const category_service_1 = require("./category.service");
const pick_1 = __importDefault(require("../../../shared/pick"));
//create category controller
const createCategory = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newCategory = {
        name: req.body.name,
        icon: (0, getFilePath_1.getSingleFilePath)(req.files, 'icon'),
    };
    const result = yield category_service_1.CategoryService.createCategoryToDB(newCategory);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result,
    });
}));
//get single category controller
const getCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield category_service_1.CategoryService.getCategoryFromDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Category data retrieved successfully',
        data: result,
    });
}));
//get all categories controller
const getCategories = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Define which query fields are filters
    const filterableFields = ['searchTerm', 'page', 'limit'];
    // Pick only allowed filters from req.query
    const filterOptions = (0, pick_1.default)(req.query, filterableFields);
    // Call service
    const { data, meta } = yield category_service_1.CategoryService.getCategoriesFromDB(filterOptions);
    // Send response
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Users retrieved successfully',
        data: data || [],
        pagination: meta || {},
    });
}));
//update category
const updateCategory = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
    let icon = (0, getFilePath_1.getSingleFilePath)(req.files, 'icon');
    const data = {
        icon,
        name: req.body.name,
    };
    const result = yield category_service_1.CategoryService.updateCategoryToDB(data, id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result
    });
}));
//delete category
const deleteCategory = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
    const result = yield category_service_1.CategoryService.deleteCategoryToDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Profile updated successfully',
        data: result,
    });
}));
exports.CategoryController = { createCategory, getCategory, getCategories, updateCategory, deleteCategory };
