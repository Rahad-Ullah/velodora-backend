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
exports.ReviewController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const review_service_1 = require("./review.service");
// create Contact Support
const createReview = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield review_service_1.ReviewService.createReviewToDB(req.user.id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result.data,
    });
}));
const getMyReviews = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield review_service_1.ReviewService.getMyReviewsToDB(req.user.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result.data,
    });
}));
const getProviderReviews = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield review_service_1.ReviewService.getMyReviewsToDB(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result.data,
    });
}));
const getMyRatings = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield review_service_1.ReviewService.getMyRatingsToDB(req.user.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result.data,
    });
}));
exports.ReviewController = { createReview, getMyReviews, getProviderReviews, getMyRatings };
