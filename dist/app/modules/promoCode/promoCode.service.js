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
exports.PromoCodeService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const promoCode_model_1 = require("./promoCode.model");
// delete promo code from DB
const deletePromoCodeFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistPromoCode = yield promoCode_model_1.PromoCodeModel.findByIdAndDelete(id);
    if (!isExistPromoCode) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Promo code not found');
    }
    return { code: isExistPromoCode, message: "Promo code deleted successfully" };
});
// get promo code from DB
const getPromoCodeFromDB = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistPromoCode = yield promoCode_model_1.PromoCodeModel.findOne({
        code: code,
        limits: { $gt: 0 },
        start: { $lt: new Date() },
        end: { $gt: new Date() },
    });
    if (!isExistPromoCode) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Promo code not found or expired');
    }
    return { code: isExistPromoCode, message: "Promo code found successfully" };
});
// create promo code to DB
const createPromoCodeToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistPromoCode = yield promoCode_model_1.PromoCodeModel.findOne({ code: payload.code });
    if (isExistPromoCode) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Promo code already exist');
    }
    // Save in DB
    const promoCode = yield promoCode_model_1.PromoCodeModel.create(payload);
    if (!promoCode) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create promo code');
    }
    return { code: promoCode, message: "Promo code created successfully" };
});
// get promo codes from DB
const getPromoCodesFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const isExistPromoCodes = yield promoCode_model_1.PromoCodeModel.aggregate([
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "bookings",
                let: { promo_code: "$code" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$promoCode", "$$promo_code"] } } },
                    { $count: "count" }
                ],
                as: "bookings"
            }
        },
        {
            $addFields: {
                totalUsed: {
                    $ifNull: [{ $arrayElemAt: ["$bookings.count", 0] }, 0]
                }
            }
        },
        {
            $project: {
                bookings: 0 // optional — removes the raw bookings array
            }
        }
    ]);
    if (!isExistPromoCodes) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Promo codes not found');
    }
    return { codes: isExistPromoCodes, message: "Promo codes found successfully" };
});
exports.PromoCodeService = {
    createPromoCodeToDB,
    getPromoCodesFromDB,
    getPromoCodeFromDB,
    deletePromoCodeFromDB,
};
