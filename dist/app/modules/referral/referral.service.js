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
exports.ReferralService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const generateRefferalCode_1 = require("../../../util/generateRefferalCode");
const referral_model_1 = require("./referral.model");
// get referral code from DB
const getReferralFromDB = (adminId) => __awaiter(void 0, void 0, void 0, function* () {
    // Generate unique code
    const code = yield (0, generateRefferalCode_1.generateUniqueReferralCode)();
    const newReferral = { code, createdBy: adminId };
    // Save in DB
    const referral = yield referral_model_1.ReferralModel.create(newReferral);
    if (!referral) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create referral');
    }
    return { code, message: "Referral code created successfully" };
});
// delete referral code from DB
const deleteReferralFromDB = (referralCodeId) => __awaiter(void 0, void 0, void 0, function* () {
    // Delete from  DB
    const referral = yield referral_model_1.ReferralModel.findByIdAndDelete(referralCodeId);
    if (!referral) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create referral');
    }
    return { message: "Referral code deleted successfully" };
});
// get all referrals from DB
const getReferralsListFromDB = (_a) => __awaiter(void 0, [_a], void 0, function* ({ referralCode, status, paginationOptions }) {
    var _b, _c;
    const { page = 1, limit = 10 } = paginationOptions;
    const skip = (page - 1) * limit;
    const isStatus = status === 'active' ? false : true;
    const pipeline = [
        {
            $sort: {
                createdAt: -1
            }
        }
    ];
    if (referralCode) {
        pipeline.push({
            $match: {
                code: { $regex: referralCode } // 'i' = case-insensitive
            }
        });
    }
    if (status === 'active' || status === 'used') {
        pipeline.push({ $match: { isUsed: isStatus } });
    }
    pipeline.push({
        $lookup: {
            from: 'users',
            localField: 'usedBy',
            foreignField: '_id',
            as: 'usedBy',
            pipeline: [
                {
                    $project: {
                        name: 1,
                        email: 1,
                        contact: 1,
                        location: 1
                    }
                }
            ]
        }
    }, {
        $unwind: {
            path: '$usedBy',
            preserveNullAndEmptyArrays: true
        }
    });
    pipeline.push({
        $facet: {
            data: [
                { $skip: skip },
                { $limit: limit },
                {
                    $project: {
                        __v: 0,
                    },
                },
            ],
            countData: [
                { $count: "total" }
            ],
        },
    }, {
        $addFields: {
            total: { $ifNull: [{ $arrayElemAt: ["$countData.total", 0] }, 0] },
            limit: limit,
            page: page,
            totalPage: {
                $ceil: { $divide: [{ $ifNull: [{ $arrayElemAt: ["$countData.total", 0] }, 0] }, limit] }
            }
        }
    }, {
        $project: {
            data: 1,
            pagination: {
                total: "$total",
                limit: "$limit",
                page: "$page",
                totalPage: "$totalPage",
            }
        }
    });
    // Save in DB
    const referrals = yield referral_model_1.ReferralModel.aggregate(pipeline);
    const meta = ((_b = referrals[0]) === null || _b === void 0 ? void 0 : _b.pagination) || {
        total: 0,
        limit,
        page,
        totalPage: 0,
    };
    return { data: ((_c = referrals[0]) === null || _c === void 0 ? void 0 : _c.data) || [], meta: meta };
});
exports.ReferralService = {
    getReferralFromDB,
    deleteReferralFromDB,
    getReferralsListFromDB,
};
