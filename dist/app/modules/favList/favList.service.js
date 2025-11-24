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
exports.FavListService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const favList_model_1 = require("./favList.model");
// add or remove provider to my fav list
const createFavListToDB = (userId, providerId) => __awaiter(void 0, void 0, void 0, function* () {
    let res = null;
    const isExistFavList = yield favList_model_1.FavListModel.findOne({ userId: new mongoose_1.default.Types.ObjectId(userId) });
    if (isExistFavList) {
        if (isExistFavList.providerIds.includes(new mongoose_1.default.Types.ObjectId(providerId))) {
            res = yield favList_model_1.FavListModel.findOneAndUpdate({ userId: new mongoose_1.default.Types.ObjectId(userId) }, { $pull: { providerIds: new mongoose_1.default.Types.ObjectId(providerId) } }, { new: true } // ✅ works here
            );
        }
        else {
            res = yield favList_model_1.FavListModel.findOneAndUpdate({ userId: new mongoose_1.default.Types.ObjectId(userId) }, { $push: { providerIds: new mongoose_1.default.Types.ObjectId(providerId) } }, { new: true } // ✅ works here
            );
        }
    }
    else {
        const payload = {
            userId: new mongoose_1.default.Types.ObjectId(userId),
            providerIds: [new mongoose_1.default.Types.ObjectId(providerId)],
        };
        res = yield favList_model_1.FavListModel.create(payload);
    }
    return res;
});
// get my fav lists
const getFavListToDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistFavList = yield favList_model_1.FavListModel.findOne({ userId: new mongoose_1.default.Types.ObjectId(userId) });
    if (!isExistFavList) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "FavList doesn't exist!");
    }
    return isExistFavList;
});
// get all favorite providers by user
const getFavListUserFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const pipeline = [
        {
            $match: {
                userId: new mongoose_1.default.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "providers",
                localField: "providerIds",
                foreignField: "_id",
                as: "providers",
                pipeline: [
                    // --------------------- include related services --------------------- //
                    {
                        $lookup: {
                            from: "services",
                            localField: "services",
                            foreignField: "_id",
                            as: "services",
                            pipeline: [
                                { $project: { category: 1, subCategory: 1, price: 1 } },
                                {
                                    $lookup: {
                                        from: "categories",
                                        localField: "category",
                                        foreignField: "_id",
                                        as: "category",
                                        pipeline: [{ $project: { name: 1 } }],
                                    },
                                },
                                { $unwind: "$category" },
                                {
                                    $lookup: {
                                        from: "subcategories",
                                        localField: "subCategory",
                                        foreignField: "_id",
                                        as: "subCategory",
                                        pipeline: [{ $project: { name: 1 } }],
                                    },
                                },
                                { $unwind: "$subCategory" },
                            ],
                        },
                    },
                    { $match: { "services.0": { $exists: true } } },
                    // --------------------- user info --------------------- //
                    {
                        $lookup: {
                            from: "users",
                            localField: "user",
                            foreignField: "_id",
                            as: "user",
                            pipeline: [{ $project: { name: 1, email: 1, image: 1 } }],
                        },
                    },
                    { $unwind: "$user" },
                    // --------------------- reviews (rating + total) --------------------- //
                    {
                        $lookup: {
                            from: "reviews",
                            let: { providerId: "$user._id" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $eq: ["$providerId", "$$providerId"] },
                                    },
                                },
                                {
                                    $group: {
                                        _id: "$providerId",
                                        averageRating: { $avg: "$rating" },
                                        totalReviews: { $sum: 1 },
                                    },
                                },
                            ],
                            as: "reviews",
                        },
                    },
                    { $unwind: { path: "$reviews", preserveNullAndEmptyArrays: true } },
                    // --------------------- flatten service fields --------------------- //
                    {
                        $addFields: {
                            firstService: { $arrayElemAt: ["$services", 0] },
                        },
                    },
                    {
                        $addFields: {
                            name: "$user.name",
                            image: "$user.image",
                            category: { $ifNull: ["$firstService.category.name", null] },
                            subCategory: { $ifNull: ["$firstService.subCategory.name", null] },
                            price: "$firstService.price",
                        },
                    },
                    // --------------------- final projection --------------------- //
                    {
                        $project: {
                            isOnline: 1,
                            name: 1,
                            image: 1,
                            category: 1,
                            subCategory: 1,
                            price: 1,
                            location: 1,
                            pricePerHour: 1,
                            primaryLocation: 1,
                            distance: 1,
                            serviceDistance: 1,
                            isActive: 1,
                            reviews: 1,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                providers: 1,
            },
        },
    ];
    const result = yield favList_model_1.FavListModel.aggregate(pipeline);
    // if no favorites found, handle gracefully
    if (!result.length || !result[0].providers) {
        return { data: [] };
    }
    return { data: result[0].providers };
});
exports.FavListService = {
    createFavListToDB,
    getFavListToDB,
    getFavListUserFromDB
};
