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
exports.ReviewService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const review_model_1 = require("./review.model");
const mongoose_1 = require("mongoose");
const user_model_1 = require("../user/user.model");
const notificationHelper_1 = require("../../../helpers/notificationHelper");
const notification_constants_1 = require("../notification/notification.constants");
const provider_model_1 = require("../provider/provider.model");
//create contact support
const createReviewToDB = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const provider = yield user_model_1.UserModel.findById(payload.providerId);
    if (!provider) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Provider doesn't exist!");
    }
    // const isReviewExist = await ReviewModel.findOne({ userId: new Types.ObjectId(userId), providerId: new Types.ObjectId(payload.providerId) });
    const newReview = {
        userId: new mongoose_1.Types.ObjectId(userId),
        providerId: new mongoose_1.Types.ObjectId(payload.providerId),
        rating: payload.rating,
        comment: payload.comment,
    };
    let res = yield review_model_1.ReviewModel.create(newReview);
    // if (isReviewExist) {
    //   res = await ReviewModel.findByIdAndUpdate(isReviewExist._id, newReview, { new: true }).exec();
    // } else {
    //   res = await ReviewModel.create(newReview);
    // }
    if (!res) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Review to Provider failed!");
    }
    (0, notificationHelper_1.sendNotifications)({
        type: notification_constants_1.NOTIFICATION_TYPE.REVIEW,
        title: 'You get a new review from ' + provider.name,
        receiver: provider._id,
        referenceId: new mongoose_1.Types.ObjectId(userId),
    });
    return { data: res };
});
const getMyReviewsToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield review_model_1.ReviewModel.aggregate([
        {
            $match: { providerId: new mongoose_1.Types.ObjectId(id) },
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    {
                        $project: {
                            name: 1,
                            image: 1,
                            email: 1,
                            _id: 1,
                        },
                    },
                ],
            },
        },
        {
            $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $group: {
                _id: "$providerId",
                averageRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 },
                reviews: {
                    $push: {
                        _id: "$_id",
                        rating: "$rating",
                        comment: "$comment",
                        createdAt: "$createdAt",
                        user: "$user", // include populated user here
                    },
                },
            },
        },
    ]);
    return { data: res[0] || null }; // since grouping by providerId, only one result
});
// get my ratings
const getMyRatingsToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const provider = yield provider_model_1.ProviderModel.aggregate([
        { $match: { user: new mongoose_1.Types.ObjectId(id) } },
        {
            $lookup: {
                from: "services",
                localField: "services",
                foreignField: "_id",
                as: "services",
                pipeline: [
                    {
                        $lookup: {
                            from: "categories",
                            localField: "category",
                            foreignField: "_id",
                            as: "category",
                        },
                    },
                    {
                        $unwind: {
                            path: "$category",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $addFields: {
                            category: "$category.name",
                        }
                    },
                    { $project: { category: 1 } }
                ],
            }
        },
        {
            $project: {
                services: 1
            }
        }
    ]);
    const res = yield review_model_1.ReviewModel.aggregate([
        {
            $match: { providerId: new mongoose_1.Types.ObjectId(id) }
        },
        {
            $group: {
                _id: "$providerId",
                averageRating: { $avg: "$rating" }, // calculate average
                totalReviews: { $sum: 1 }, // count reviews       // keep all review docs
            }
        }
    ]);
    return { data: Object.assign(Object.assign({}, (_a = provider[0]) === null || _a === void 0 ? void 0 : _a.services[0]), res[0]) };
});
exports.ReviewService = {
    createReviewToDB,
    getMyReviewsToDB,
    getMyRatingsToDB
};
