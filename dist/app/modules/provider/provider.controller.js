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
exports.ProviderController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const pick_1 = __importDefault(require("../../../shared/pick"));
const provider_service_1 = require("./provider.service");
//create provider
const createProvider = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // const filePaths = getMultipleFilesPath(req.files, 'serviceImages');
    const provider = Object.assign(Object.assign({}, req.body.data), { user: req.user.id, serviceImages: req.body.serviceImages });
    const services = req.body.services;
    const result = yield provider_service_1.ProviderService.createProviderToDB(provider, services);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result.message,
        data: result.data,
    });
}));
//get single provider
const getProvider = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield provider_service_1.ProviderService.getProviderFromDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Service data retrieved successfully',
        data: result.data,
    });
}));
//get my provider
const getUserEditedProvider = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield provider_service_1.ProviderService.getUserEditProviderFromDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Service data retrieved successfully',
        data: result.data,
    });
}));
//get my provider
const getUserProvider = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield provider_service_1.ProviderService.getMyProviderFromDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Service data retrieved successfully',
        data: result.data,
    });
}));
//get my provider
const getMyProvider = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.id;
    const result = yield provider_service_1.ProviderService.getMyProviderFromDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Service data retrieved successfully',
        data: result.data,
    });
}));
//get all providers
const getProviders = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Define which query fields are filters
    const filterableFields = ['searchTerm', 'categoryId', 'subCategoryId', 'minPrice', 'maxPrice', 'date', 'time', 'location', 'userLng', 'userLat', 'isOnline', 'verified', 'isActive', 'page', 'limit'];
    // Pick only allowed filters from req.query
    const filterOptions = (0, pick_1.default)(req.query, filterableFields);
    // Call service
    const result = yield provider_service_1.ProviderService.getProvidersFromDB(filterOptions);
    // Send response
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Providers retrieved successfully',
        data: result.data,
        pagination: result.meta,
    });
}));
//update service
const updateProvider = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const providerId = req.user.id;
    const newData = {
        data: req.body.data,
        services: req.body.services && req.body.services,
        newServiceImages: req.body.serviceImages,
        serviceImages: []
    };
    if (((_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.serviceImages) === null || _b === void 0 ? void 0 : _b.length) > 0) {
        newData.serviceImages = [...req.body.serviceImages];
    }
    if (((_d = (_c = req.body) === null || _c === void 0 ? void 0 : _c.previousServiceImages) === null || _d === void 0 ? void 0 : _d.length) > 0) {
        newData.serviceImages = [...newData.serviceImages, ...req.body.previousServiceImages];
    }
    const result = yield provider_service_1.ProviderService.updateProviderToDB(newData, providerId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result.message,
        data: result.data,
    });
}));
//delete edited provider
const deleteEditProvider = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
    const result = yield provider_service_1.ProviderService.deleteEditProviderToDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result.message,
    });
}));
//approve provider
const approveProvider = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
    const result = yield provider_service_1.ProviderService.approveProviderToDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result.message,
    });
}));
//delete provider
const deleteProvider = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
    const result = yield provider_service_1.ProviderService.deleteProviderToDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result.message,
    });
}));
//online ofline provider
const onlineOflineProvider = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const result = yield provider_service_1.ProviderService.onlineOflineProviderToDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result.message,
        data: result.data,
    });
}));
//active block provider
const activeBlockProvider = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
    const result = yield provider_service_1.ProviderService.activeBlockProviderToDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result.message,
        data: result.data,
    });
}));
//delete edited provider
const approveEditProvider = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
    const result = yield provider_service_1.ProviderService.approveEditProviderToDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result.message,
    });
}));
exports.ProviderController = { createProvider, getMyProvider, getUserProvider, getUserEditedProvider, getProvider, getProviders, updateProvider, deleteProvider, approveProvider, approveEditProvider, deleteEditProvider, activeBlockProvider, onlineOflineProvider };
