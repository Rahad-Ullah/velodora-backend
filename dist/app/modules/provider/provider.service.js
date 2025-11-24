"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.ProviderService = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const provider_model_1 = require("./provider.model");
const service_model_1 = require("../service/service.model");
const providerTemp_model_1 = require("./providerTemp.model");
const unlinkFile_1 = require("../../../shared/unlinkFile");
const service_1 = require("../../../enums/service");
const user_model_1 = require("../user/user.model");
const booking_model_1 = require("../booking/booking.model");
const booking_1 = require("../../../enums/booking");
//create provider
const createProviderToDB = (providerInfo, servicesInfo) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        // ✅ Check if provider already exists
        const isExistProvider = yield provider_model_1.ProviderModel.findOne({ user: providerInfo.user }).session(session);
        if (isExistProvider) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Provider already exists! Please check your profile.");
        }
        // ✅ Insert services
        const servicesResult = yield service_model_1.ServiceModel.insertMany(servicesInfo, { session });
        const servicesId = servicesResult.map((service) => service._id);
        // ✅ Create provider with linked services
        const providerData = Object.assign(Object.assign({}, providerInfo), { isActive: false, services: servicesId });
        const provider = yield provider_model_1.ProviderModel.create([providerData], { session });
        // ✅ Commit transaction
        yield session.commitTransaction();
        return { data: provider[0], message: "Provider created successfully" };
    }
    catch (error) {
        // ❌ Rollback if anything fails
        yield session.abortTransaction();
        // cleanup any uploaded images
        providerInfo.serviceImages && (0, unlinkFile_1.unlinkFiles)(providerInfo.serviceImages);
        throw error;
    }
    finally {
        // ✅ Always end session
        session.endSession();
    }
});
//get single provider from DB
const getMyProviderFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistService = yield provider_model_1.ProviderModel.aggregate([
        { $match: { user: new mongoose_1.Types.ObjectId(id) } },
        {
            $lookup: {
                from: 'services', localField: 'services', foreignField: '_id', as: 'services',
                pipeline: [
                    {
                        $lookup: {
                            from: 'categories',
                            localField: 'category',
                            foreignField: '_id',
                            as: 'category',
                        },
                    },
                    {
                        $unwind: {
                            path: '$category',
                            preserveNullAndEmptyArrays: true,
                        }
                    },
                    {
                        $lookup: {
                            from: 'subcategories',
                            localField: 'subCategory',
                            foreignField: '_id',
                            as: 'subCategory',
                        },
                    },
                    {
                        $unwind: {
                            path: '$subCategory',
                            preserveNullAndEmptyArrays: true,
                        }
                    },
                ]
            }
        },
        { $lookup: { from: 'schedules', localField: '_id', foreignField: 'provider', as: 'schedules' } },
        { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    ]);
    if (!isExistService) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Service doesn't exist!");
    }
    return { data: isExistService[0] };
});
//get single provider from DB
const getUserEditProviderFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistService = yield providerTemp_model_1.ProviderTempModel.aggregate([
        { $match: { user: new mongoose_1.Types.ObjectId(id) } },
        {
            $lookup: {
                from: 'services', localField: 'services', foreignField: '_id', as: 'services',
                pipeline: [
                    {
                        $lookup: {
                            from: 'categories',
                            localField: 'category',
                            foreignField: '_id',
                            as: 'category',
                        },
                    },
                    {
                        $unwind: {
                            path: '$category',
                            preserveNullAndEmptyArrays: true,
                        }
                    },
                    {
                        $lookup: {
                            from: 'subcategories',
                            localField: 'subCategory',
                            foreignField: '_id',
                            as: 'subCategory',
                        },
                    },
                    {
                        $unwind: {
                            path: '$subCategory',
                            preserveNullAndEmptyArrays: true,
                        }
                    },
                ]
            }
        },
        // { $lookup: { from: 'schedules', localField: '_id', foreignField: 'provider', as: 'schedules' } },
        { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    ]);
    if (!isExistService) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Service doesn't exist!");
    }
    return { data: isExistService[0] };
});
//get single provider from DB
const getProviderFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistService = yield provider_model_1.ProviderModel.aggregate([
        { $match: { _id: new mongoose_1.Types.ObjectId(id) } },
        {
            $lookup: {
                from: 'users', localField: 'user', foreignField: '_id', as: 'user',
                pipeline: [
                    { $project: { name: 1, email: 1, contact: 1, image: 1 } }
                ]
            }
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'services', localField: 'services', foreignField: '_id', as: 'services',
                pipeline: [
                    {
                        $lookup: {
                            from: 'categories',
                            localField: 'category',
                            foreignField: '_id',
                            as: 'category',
                        },
                    },
                    {
                        $unwind: {
                            path: '$category',
                            preserveNullAndEmptyArrays: true,
                        }
                    },
                    {
                        $lookup: {
                            from: 'subcategories',
                            localField: 'subCategory',
                            foreignField: '_id',
                            as: 'subCategory',
                        },
                    },
                    {
                        $unwind: {
                            path: '$subCategory',
                            preserveNullAndEmptyArrays: true,
                        }
                    },
                ]
            }
        },
        // { $lookup: { from: 'schedules', localField: '_id', foreignField: 'provider', as: 'schedules' } },
    ]);
    if (!isExistService) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Service doesn't exist!");
    }
    return { data: isExistService };
});
// get all providers from DB
const getProvidersFromDB = (filterOptions) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { searchTerm, categoryId, subCategoryId, minPrice, maxPrice, location, date, time, userLng, userLat, } = filterOptions;
    const page = Number(filterOptions.page) || 1;
    const limit = Number(filterOptions.limit) || 10;
    const skip = (page - 1) * limit;
    const isOnline = (filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.isOnline) === 'true' ? true : false;
    const verified = (filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.verified) === 'true' ? true : false;
    const isActive = (filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.isActive) === 'true' ? true : false;
    // Build service filter dynamically
    const serviceMatch = {};
    let searchTermMatch = {};
    let primaryLocation = {};
    let dateMatch = {};
    let timeMatch = {};
    // match date
    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        dateMatch = { date: { $gte: startOfDay, $lte: endOfDay } };
    }
    // match time
    if (time) {
        const timeDate = new Date(time);
        timeMatch = {
            "schedules.available_slots": {
                $elemMatch: {
                    start: { $lte: timeDate },
                    end: { $gte: timeDate },
                },
            },
        };
    }
    // match primaryLocation
    if (location) {
        primaryLocation = { primaryLocation: { $regex: location, $options: "i" } };
    }
    // match category
    if (categoryId) {
        serviceMatch.category = new mongoose_1.default.Types.ObjectId(categoryId);
    }
    // match sub category
    if (subCategoryId) {
        serviceMatch.subCategory = new mongoose_1.default.Types.ObjectId(subCategoryId);
    }
    // match searchTerm work on category and subCategory name
    if (searchTerm) {
        searchTermMatch["$or"] = [
            { "category.name": { $regex: searchTerm, $options: "i" } },
            { "subCategory.name": { $regex: searchTerm, $options: "i" } },
        ];
    }
    // match price
    if (minPrice !== undefined || maxPrice !== undefined) {
        serviceMatch.price = {};
        if (minPrice !== undefined) {
            serviceMatch.price.$gte = Number(minPrice);
        }
        if (maxPrice !== undefined) {
            serviceMatch.price.$lte = Number(maxPrice);
        }
    }
    // Aggregation pipeline definition //
    const pipeline = [];
    if (isOnline) {
        pipeline.push({
            $match: {
                isOnline: isOnline
            }
        });
    }
    if (isActive) {
        pipeline.push({
            $match: {
                isActive: isActive
            }
        });
    }
    if (verified) {
        pipeline.push({
            $match: {
                verified: verified
            }
        });
    }
    // ✅ Add geoNear first only if userLat & userLng exist
    if (userLat !== undefined && userLng !== undefined) {
        pipeline.push({
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [Number(userLng), Number(userLat)], // [lng, lat]
                },
                distanceField: "distance", // will store distance in km now
                spherical: true,
                distanceMultiplier: 0.001, // ✅ convert meters → km
            },
        });
    }
    pipeline.push({ $match: primaryLocation }, {
        $lookup: {
            from: "services",
            localField: "services",
            foreignField: "_id",
            as: "services",
            pipeline: [
                { $match: serviceMatch },
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
                { $match: searchTermMatch },
            ],
        },
    }, { $match: { "services.0": { $exists: true } } }, 
    // { $unwind: "$services"},
    {
        $lookup: {
            from: "schedules",
            localField: "_id",
            foreignField: "provider",
            as: "schedules",
            pipeline: [{ $match: dateMatch }],
        },
    }, { $match: { "schedules.0": { $exists: true } } }, { $match: timeMatch }, {
        $lookup: {
            from: "reviews",
            let: { providerId: "$user" }, // <-- use current provider's userId
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
    }, { $unwind: { path: "$reviews", preserveNullAndEmptyArrays: true } }, {
        $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
            pipeline: [{ $project: { name: 1, email: 1, image: 1 } }],
        },
    }, { $unwind: "$user" }, {
        $addFields: {
            firstService: { $arrayElemAt: ["$services", 0] },
        },
    }, {
        $addFields: {
            name: "$user.name",
            image: "$user.image",
            category: { $ifNull: ["$firstService.category.name", null] },
            subCategory: { $ifNull: ["$firstService.subCategory.name", null] },
            price: "$firstService.price",
        },
    }, {
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
            reviews: {
                $cond: {
                    if: { $ne: ["$reviews", null] }, // if reviews field exists (not null)
                    then: "$reviews",
                    else: "$$REMOVE", // removes field entirely from result
                },
            },
        },
    }, {
        $facet: {
            data: [{ $skip: skip }, { $limit: limit }],
            total: [{ $count: "count" }]
        }
    });
    const providers = yield provider_model_1.ProviderModel.aggregate(pipeline);
    const total = Number((_a = providers[0].total[0]) === null || _a === void 0 ? void 0 : _a.count);
    const totalPage = Math.ceil(((_b = providers[0].total[0]) === null || _b === void 0 ? void 0 : _b.count) / limit);
    const meta = {
        total: total !== null && total !== void 0 ? total : 0,
        page: page,
        limit: limit,
        totalPage: totalPage !== null && totalPage !== void 0 ? totalPage : 0
    };
    return { data: providers[0].data, meta: meta };
});
//update provider
const updateProviderToDB = (payload, providerId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        // ✅ Check if provider exists
        const isExistProvider = yield provider_model_1.ProviderModel.findOne({ user: providerId }).session(session);
        if (!isExistProvider) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Provider(service) doesn't exist!");
        }
        else if (!(isExistProvider === null || isExistProvider === void 0 ? void 0 : isExistProvider.isActive)) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Right now your service is not active!");
        }
        // ✅ Check if provider has a pending edit request
        const isExistEditedProvider = yield providerTemp_model_1.ProviderTempModel.findOne({ ref: isExistProvider._id }).session(session);
        if (isExistEditedProvider) {
            payload.newServiceImages && (0, unlinkFile_1.unlinkFiles)(payload.newServiceImages);
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "You have already approval request!");
        }
        // ✅ Authorization check
        if ((isExistProvider === null || isExistProvider === void 0 ? void 0 : isExistProvider.user.toString()) !== providerId) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "You are not authorized to update this service!");
        }
        // ✅ Prepare updated provider data
        let updatedProvider = Object.assign(Object.assign({}, payload.data), { user: isExistProvider === null || isExistProvider === void 0 ? void 0 : isExistProvider.user, ref: isExistProvider === null || isExistProvider === void 0 ? void 0 : isExistProvider._id });
        if (payload.newServiceImages) {
            updatedProvider.serviceImages = payload.newServiceImages;
        }
        // ✅ Insert new services
        const servicesNew = ((_a = payload.services) === null || _a === void 0 ? void 0 : _a.new)
            ? yield service_model_1.ServiceModel.insertMany(payload.services.new.map((service) => (Object.assign(Object.assign({}, service), { status: service_1.SERVICE_STATUS.NEW }))), { session })
            : [];
        // ✅ Insert updated services
        const servicesUpdate = ((_b = payload.services) === null || _b === void 0 ? void 0 : _b.update)
            ? yield service_model_1.ServiceModel.insertMany(payload.services.update.map((service) => (Object.assign(Object.assign({}, service), { status: service_1.SERVICE_STATUS.EDITED }))), { session })
            : [];
        // ✅ Keep existing services (not updated)
        const servicesExist = isExistProvider.services.filter((serviceId) => !servicesUpdate
            .map((service) => { var _a, _b; return (_b = (_a = service.ref) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a); })
            .includes(serviceId.toString()));
        updatedProvider.services = [
            ...servicesUpdate.map((service) => service._id),
            ...servicesNew.map((service) => service._id),
            ...servicesExist,
        ];
        // ✅ Create temp provider (pending approval)
        const res = yield providerTemp_model_1.ProviderTempModel.create([updatedProvider], { session });
        // ✅ Mark user as modified
        yield user_model_1.UserModel.findByIdAndUpdate(isExistProvider.user, { $set: { isModify: true } }, { new: true, session });
        // ✅ Commit transaction
        yield session.commitTransaction();
        return {
            data: res[0],
            message: "Service update request sent successfully!",
        };
    }
    catch (error) {
        // ❌ Rollback transaction and cleanup
        yield session.abortTransaction();
        payload.newServiceImages && (0, unlinkFile_1.unlinkFiles)(payload.newServiceImages);
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, error.message);
    }
    finally {
        yield session.endSession();
    }
});
//approve edited provider
const approveEditProviderToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const isExistProviderTemp = yield providerTemp_model_1.ProviderTempModel.findOne({ user: id }).session(session);
        if (!isExistProviderTemp) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Provider update request doesn't exist!");
        }
        const isExistProvider = yield provider_model_1.ProviderModel.findOne({ user: id }).session(session);
        if (!isExistProvider) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Old Provider doesn't exist!");
        }
        const newProvider = {
            location: (_a = isExistProviderTemp.location) !== null && _a !== void 0 ? _a : isExistProvider.location,
            user: (_b = isExistProviderTemp.user) !== null && _b !== void 0 ? _b : isExistProvider.user,
            aboutMe: (_c = isExistProviderTemp.aboutMe) !== null && _c !== void 0 ? _c : isExistProvider.aboutMe,
            serviceLanguage: (_d = isExistProviderTemp.serviceLanguage) !== null && _d !== void 0 ? _d : isExistProvider.serviceLanguage,
            primaryLocation: (_e = isExistProviderTemp.primaryLocation) !== null && _e !== void 0 ? _e : isExistProvider.primaryLocation,
            serviceDistance: (_f = isExistProviderTemp.serviceDistance) !== null && _f !== void 0 ? _f : isExistProvider.serviceDistance,
            pricePerHour: (_g = isExistProviderTemp.pricePerHour) !== null && _g !== void 0 ? _g : isExistProvider.pricePerHour,
            serviceImages: (_h = isExistProviderTemp.serviceImages) !== null && _h !== void 0 ? _h : isExistProvider.serviceImages,
            isRead: (_j = isExistProviderTemp.isRead) !== null && _j !== void 0 ? _j : isExistProvider.isRead,
            isActive: true,
            verified: true,
        };
        let newServices = [];
        for (const serviceId of isExistProviderTemp.services) {
            const service = yield service_model_1.ServiceModel.findById(serviceId).session(session);
            if (service && (service.status === service_1.SERVICE_STATUS.NEW || service.status === service_1.SERVICE_STATUS.OLD)) {
                newServices.push(service._id);
            }
            else if (service && service.status === service_1.SERVICE_STATUS.EDITED) {
                yield service_model_1.ServiceModel.findByIdAndUpdate(service.ref, {
                    category: service.category,
                    subCategory: service.subCategory,
                    price: service.price,
                    status: service_1.SERVICE_STATUS.OLD,
                }, { new: true, session });
                newServices.push(service.ref);
            }
        }
        yield provider_model_1.ProviderModel.findOneAndUpdate({ user: id }, Object.assign(Object.assign({}, newProvider), { services: newServices }), { new: true, session });
        yield user_model_1.UserModel.findByIdAndUpdate(id, { $set: { isModify: false } }, { new: true, session });
        yield providerTemp_model_1.ProviderTempModel.findOneAndDelete({ user: id }).session(session);
        // Commit transaction before unlinking files
        yield session.commitTransaction();
        session.endSession();
        // Clean up old images (outside transaction)
        try {
            isExistProvider.serviceImages.forEach((serviceImage) => {
                if (!isExistProviderTemp.serviceImages.includes(serviceImage)) {
                    (0, unlinkFile_1.unlinkFile)(serviceImage);
                }
            });
        }
        catch (cleanupErr) {
            console.error("File cleanup failed:", cleanupErr);
        }
        return { message: "Service edit request approved successfully!" };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Failed to approve edited provider!");
    }
});
//delete provider
const deleteEditProviderToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
        const isExistProviderTemp = yield providerTemp_model_1.ProviderTempModel.findOneAndDelete({ user: id }).session(session);
        if (!isExistProviderTemp) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Edit Provider doesn't exist!");
        }
        // unlink files here
        if (isExistProviderTemp === null || isExistProviderTemp === void 0 ? void 0 : isExistProviderTemp.serviceImages) {
            (0, unlinkFile_1.unlinkFiles)(isExistProviderTemp.serviceImages);
        }
        yield user_model_1.UserModel.findByIdAndUpdate(id, { $set: { isModify: false } }, { new: true, session });
        // Commit transaction before unlinking files
        yield session.commitTransaction();
        session.endSession();
        return { message: "Service deleted successfully!" };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Failed to delete edited provider!");
    }
});
// Approve provider
const approveProviderToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        // 1. Update provider
        const updatedProvider = yield provider_model_1.ProviderModel.findOneAndUpdate({ user: id }, { $set: { isActive: true, verified: true } }, { new: true, session });
        if (!updatedProvider) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Provider doesn't exist!");
        }
        // 2. Update related user
        const updatedUser = yield user_model_1.UserModel.findByIdAndUpdate(updatedProvider.user, { $set: { isActive: true, verifiedService: true, isService: true } }, { new: true, session });
        if (!updatedUser) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
        }
        // Commit transaction before unlinking files
        yield session.commitTransaction();
        session.endSession();
        // 3. Return success message
        return { message: "Approved successfully!" };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Failed to approve provider!");
    }
});
//delete provider
const deleteProviderToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistService = yield provider_model_1.ProviderModel.findOneAndDelete({ user: id });
    if (!isExistService) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Provider doesn't exist!");
    }
    const isUser = yield user_model_1.UserModel.findByIdAndDelete(id);
    if (!isUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    // unlink files here
    if (isExistService === null || isExistService === void 0 ? void 0 : isExistService.serviceImages) {
        (0, unlinkFile_1.unlinkFiles)(isExistService.serviceImages);
    }
    return { message: "Service deleted successfully!" };
});
//delete provider
const activeBlockProviderToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    const isExistService = yield provider_model_1.ProviderModel.findOne({ user: id });
    if (!isExistService) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Provider doesn't exist!");
    }
    const isUser = yield user_model_1.UserModel.findById(id);
    if (!isUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    try {
        session.startTransaction();
        const res = yield provider_model_1.ProviderModel.findByIdAndUpdate(isExistService._id, { $set: { isActive: !(isExistService === null || isExistService === void 0 ? void 0 : isExistService.isActive), verified: true } }, { new: true, session });
        yield user_model_1.UserModel.findByIdAndUpdate(id, { $set: { verifiedService: !(isExistService === null || isExistService === void 0 ? void 0 : isExistService.isActive) } }, { new: true, session });
        yield session.commitTransaction();
        session.endSession();
        return { message: `Provider ${(isExistService === null || isExistService === void 0 ? void 0 : isExistService.isActive) ? 'blocked' : 'unblocked'} successfully!`, data: res };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Failed to Active/Block provider!");
    }
});
//Online/Offline Provider
const onlineOflineProviderToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistService = yield provider_model_1.ProviderModel.findOne({ user: id });
    if (!isExistService) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Provider doesn't exist!");
    }
    if (isExistService === null || isExistService === void 0 ? void 0 : isExistService.isOnline) {
        const isPendingBooking = yield booking_model_1.BookingModel.find({ provider: isExistService._id, status: booking_1.BOOKING_STATUS.PENDING, paymentStatus: booking_1.BOOKING_PAYMENT_STATUS.PAID }).lean();
        if (isPendingBooking.length > 0) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "You have pending booking!");
        }
    }
    const res = yield provider_model_1.ProviderModel.findByIdAndUpdate(isExistService._id, { $set: { isOnline: !(isExistService === null || isExistService === void 0 ? void 0 : isExistService.isOnline) } }, { new: true });
    return { message: `Provider is ${(res === null || res === void 0 ? void 0 : res.isOnline) ? 'Online' : 'Offline'} now`, data: res };
});
exports.ProviderService = {
    createProviderToDB,
    getMyProviderFromDB,
    getProviderFromDB,
    getProvidersFromDB,
    updateProviderToDB,
    deleteProviderToDB,
    approveEditProviderToDB,
    deleteEditProviderToDB,
    approveProviderToDB,
    activeBlockProviderToDB,
    getUserEditProviderFromDB,
    onlineOflineProviderToDB,
};
