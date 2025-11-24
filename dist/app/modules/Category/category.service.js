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
exports.CategoryService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const unlinkFile_1 = require("../../../shared/unlinkFile");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const category_model_1 = require("./category.model");
//create category
const createCategoryToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistCategory = yield category_model_1.CategoryModel.findOne({ name: payload.name });
    if (isExistCategory === null || isExistCategory === void 0 ? void 0 : isExistCategory.icon) {
        (0, unlinkFile_1.unlinkFile)(payload.icon);
        return "Category already exist!";
    }
    const res = yield category_model_1.CategoryModel.create(payload);
    return res;
});
//get category
const getCategoryFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistCategory = yield category_model_1.CategoryModel.findById(id);
    if (!isExistCategory) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Category doesn't exist!");
    }
    return isExistCategory;
});
//get categories
const getCategoriesFromDB = (filterOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const query = Object.assign({}, filterOptions);
    const searchableFields = ['name'];
    const builder = new QueryBuilder_1.default(category_model_1.CategoryModel.find(), query);
    const usersQuery = builder
        .search(searchableFields)
        .paginate();
    const data = yield usersQuery.modelQuery.lean();
    const meta = yield usersQuery.getPaginationInfo();
    return { data, meta };
});
//update category
const updateCategoryToDB = (payload, id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistCategory = yield category_model_1.CategoryModel.findById(id);
    if (!isExistCategory) {
        (payload === null || payload === void 0 ? void 0 : payload.icon) && (0, unlinkFile_1.unlinkFile)(payload.icon);
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Category doesn't exist!");
    }
    //unlink file here
    if (payload.icon && (isExistCategory === null || isExistCategory === void 0 ? void 0 : isExistCategory.icon)) {
        (0, unlinkFile_1.unlinkFile)(isExistCategory.icon);
    }
    yield category_model_1.CategoryModel.findOneAndUpdate({ _id: id }, payload);
    return "Category updated successfully!";
});
//update category
const deleteCategoryToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistCategory = yield category_model_1.CategoryModel.findByIdAndDelete(id);
    if (!isExistCategory) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Category doesn't exist!");
    }
    //unlink file here
    if (isExistCategory === null || isExistCategory === void 0 ? void 0 : isExistCategory.icon) {
        (0, unlinkFile_1.unlinkFile)(isExistCategory.icon);
    }
    return "Category deleted successfully!";
});
exports.CategoryService = {
    createCategoryToDB,
    getCategoryFromDB,
    getCategoriesFromDB,
    updateCategoryToDB,
    deleteCategoryToDB
};
