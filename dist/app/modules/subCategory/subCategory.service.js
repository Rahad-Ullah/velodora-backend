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
exports.SubCategoryService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const subCategory_model_1 = require("./subCategory.model");
const category_model_1 = require("../Category/category.model");
//create sub category
const createSubCategoryToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistCategory = yield category_model_1.CategoryModel.findById(payload.category);
    if (!isExistCategory) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Category doesn't exist!");
    }
    const res = yield subCategory_model_1.SubCategoryModel.create(payload);
    return { data: res };
});
//get sub category
const getSubCategoryFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistSubCategory = yield subCategory_model_1.SubCategoryModel.findById(id);
    if (!isExistSubCategory) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Sub Category doesn't exist!");
    }
    return { data: isExistSubCategory };
});
//get sub categories
const getSubCategoriesFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryObj = {
        name: query.searchTerm || '',
    };
    // Only add category filter if a category is provided in the query
    if (query.category) {
        queryObj.category = new mongoose_1.default.Types.ObjectId(query.category);
    }
    const data = yield subCategory_model_1.SubCategoryModel.aggregate([
        {
            $match: Object.assign(Object.assign({}, queryObj), { name: { $regex: queryObj.name, $options: 'i' } })
        },
        {
            $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category',
            },
        },
        {
            $unwind: '$category',
        },
        {
            $addFields: {
                categoryName: '$category.name',
                subCategoryName: '$name',
            },
        },
        {
            $project: {
                categoryName: 1,
                subCategoryName: 1,
            },
        },
    ]);
    return { data };
});
//update sub category
const updateSubCategoryToDB = (payload, id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistSubCategory = yield subCategory_model_1.SubCategoryModel.findById(id);
    if (!isExistSubCategory) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Sub Category doesn't exist!");
    }
    if (payload.category) {
        const isExistCategory = yield category_model_1.CategoryModel.findById(payload.category);
        if (!isExistCategory) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Category doesn't exist!");
        }
    }
    const res = yield subCategory_model_1.SubCategoryModel.findOneAndUpdate({ _id: id }, payload, { new: true });
    return { res, message: "Sub Category updated successfully!" };
});
//delete sub category
const deleteSubCategoryToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistCategory = yield subCategory_model_1.SubCategoryModel.findByIdAndDelete(id);
    if (!isExistCategory) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Sub Category doesn't exist!");
    }
    return "Category deleted successfully!";
});
exports.SubCategoryService = {
    createSubCategoryToDB,
    getSubCategoryFromDB,
    getSubCategoriesFromDB,
    updateSubCategoryToDB,
    deleteSubCategoryToDB
};
