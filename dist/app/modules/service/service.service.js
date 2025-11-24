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
exports.ServiceService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const service_model_1 = require("./service.model");
const category_model_1 = require("../Category/category.model");
const subCategory_model_1 = require("../subCategory/subCategory.model");
//create category
const createServiceToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isCategoryExist = yield category_model_1.CategoryModel.findOne({ _id: payload.category });
    if (!isCategoryExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Service category doesn't exist!");
    }
    const isSubCategoryExist = yield subCategory_model_1.SubCategoryModel.findOne({ _id: payload.subCategory });
    if (!isSubCategoryExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Service Sub-Category doesn't exist!");
    }
    if (!payload.price) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Service price is required!");
    }
    const newServiceData = {
        category: payload.category,
        subCategory: payload.subCategory,
        price: payload.price
    };
    const res = yield service_model_1.ServiceModel.create(newServiceData);
    return { data: res };
});
//get Service
const getServiceFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistService = yield service_model_1.ServiceModel.findById(id);
    if (!isExistService) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Service doesn't exist!");
    }
    return { data: isExistService };
});
//get categories
const getServicesFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const services = yield service_model_1.ServiceModel.find({});
    return { data: services };
});
//update category
const updateServiceToDB = (payload, id) => __awaiter(void 0, void 0, void 0, function* () {
    const newServiceData = {};
    if (payload.category) {
        const isCategoryExist = yield category_model_1.CategoryModel.findOne({ _id: payload.category });
        if (!isCategoryExist) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Service category doesn't exist!");
        }
        newServiceData.category = payload.category;
    }
    if (payload.subCategory) {
        const isSubCategoryExist = yield subCategory_model_1.SubCategoryModel.findOne({ _id: payload.subCategory });
        if (!isSubCategoryExist) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "SubCategory doesn't exist!");
        }
        newServiceData.subCategory = payload.subCategory;
    }
    if (payload.price) {
        newServiceData.price = payload.price;
    }
    const res = yield service_model_1.ServiceModel.findByIdAndUpdate(id, newServiceData, { new: true });
    if (!res) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Service doesn't exist!");
    }
    return { data: res };
});
// delete service
const deleteServiceToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistService = yield service_model_1.ServiceModel.findByIdAndDelete(id);
    if (!isExistService) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Service doesn't exist!");
    }
    return { message: "Service deleted successfully!" };
});
exports.ServiceService = {
    createServiceToDB,
    getServiceFromDB,
    getServicesFromDB,
    updateServiceToDB,
    deleteServiceToDB
};
