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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const http_status_codes_1 = require("http-status-codes");
const user_1 = require("../../../enums/user");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const emailHelper_1 = require("../../../helpers/emailHelper");
const emailTemplate_1 = require("../../../shared/emailTemplate");
const unlinkFile_1 = require("../../../shared/unlinkFile");
const generateOTP_1 = __importDefault(require("../../../util/generateOTP"));
const user_model_1 = require("./user.model");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const referral_model_1 = require("../referral/referral.model");
const logger_1 = require("../../../shared/logger");
const userTemp_model_1 = require("./userTemp.model");
const credits_model_1 = require("../credits/credits.model");
const rsdCreditsConver_1 = require("../../../helpers/rsdCreditsConver");
const stripe_config_1 = __importDefault(require("../../config/stripe.config"));
const mongoose_1 = __importDefault(require("mongoose"));
//create single user to db
const createUserToDB = (payload, referralCode) => __awaiter(void 0, void 0, void 0, function* () {
    let message = '';
    let createUser = {};
    const now = new Date();
    if (payload.role === user_1.USER_ROLES.PROVIDER && !referralCode) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Referral code is required for provider');
    }
    if (payload.role === user_1.USER_ROLES.PROVIDER && referralCode) {
        const isExistReferral = yield referral_model_1.ReferralModel.findOne({
            code: referralCode,
            isUsed: false,
            createdAt: { $gte: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) },
        });
        if (!isExistReferral) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Referral code is invalid');
        }
    }
    const isExistUser = yield user_model_1.UserModel.isExistUserByEmail(payload === null || payload === void 0 ? void 0 : payload.email);
    if (isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.verified) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.CONFLICT, 'User already exist! Please Login');
    }
    if (isExistUser && !(isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.verified)) {
        createUser = isExistUser;
        message = "User already exist! Please verify your account";
    }
    else if (!isExistUser) {
        const res = yield user_model_1.UserModel.create(payload);
        if (res) {
            createUser = res;
            message = 'User created successfully! Please verify your account';
            if ((createUser === null || createUser === void 0 ? void 0 : createUser.role) === user_1.USER_ROLES.PROVIDER) {
                yield referral_model_1.ReferralModel.findOneAndUpdate({ code: referralCode }, { $set: { isUsed: true, usedBy: res._id } });
            }
        }
        else {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create user');
        }
    }
    //send email
    const otp = (0, generateOTP_1.default)();
    const values = {
        name: createUser.name,
        otp: otp,
        email: createUser.email,
    };
    const createAccountTemplate = emailTemplate_1.emailTemplate.createAccount(values);
    emailHelper_1.emailHelper.sendEmail(createAccountTemplate);
    //save to DB
    const authentication = {
        isSendOtp: true,
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 3 * 60 * 1000),
    };
    yield user_model_1.UserModel.findOneAndUpdate({ email: createUser.email }, { $set: { authentication } });
    return message;
});
//create sub admin to db
const createSubAdminToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield user_model_1.UserModel.isExistUserByEmail(payload === null || payload === void 0 ? void 0 : payload.email);
    if (isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.verified) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.CONFLICT, 'User already exist! Please Login');
    }
    const newPayload = {
        role: user_1.USER_ROLES.ADMIN,
        email: payload.email,
        password: "123456",
        verified: true,
        isActive: true,
    };
    const res = yield user_model_1.UserModel.create(newPayload);
    let message = '';
    if (res) {
        message = 'User created successfully';
    }
    else {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create user');
    }
    return message;
});
// delete sub admin from db
const deleteSubAdminFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield user_model_1.UserModel.findByIdAndDelete(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.CONFLICT, 'Sub Admin does not exist!');
    }
    return 'Sub Admin deleted successfully';
});
//create multiple users to db
const createUsersToDB = (payloads) => __awaiter(void 0, void 0, void 0, function* () {
    const messages = [];
    for (const payload of payloads) {
        if (!payload.email) {
            messages.push('Missing email in payload.');
            continue;
        }
        // payload.role = USER_ROLES.USER;
        const isExistUser = yield user_model_1.UserModel.isExistUserByEmail(payload.email);
        if (isExistUser) {
            messages.push(`User with ${payload.email} already exists!`);
        }
        else {
            try {
                const res = yield user_model_1.UserModel.create(payload);
                if (res) {
                    messages.push(`User with ${payload.email} created successfully!`);
                }
                else {
                    messages.push(`Failed to create user with ${payload.email}`);
                }
            }
            catch (error) {
                messages.push(`Error creating user ${payload.email}: ${error.message}`);
            }
        }
    }
    return messages;
});
//get user profile from db
const getUserProfileFromDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = user;
    const isExistUser = yield user_model_1.UserModel.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    else if ((isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.isDeleted) === true) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User is deleted!");
    }
    return isExistUser;
});
//get user profile by admin
const getUserFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield user_model_1.UserModel.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    return isExistUser;
});
//get edited user(provider) profile by admin
const getEditedUserFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield userTemp_model_1.UserTempModel.findOne({ ref: id });
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    return isExistUser;
});
//get all users by admin
const getUsersFromDB = (filterOptions, paginationOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10 } = paginationOptions;
    const query = Object.assign(Object.assign({}, filterOptions), { page,
        limit });
    const searchableFields = ['name', 'email', 'location', 'contact'];
    const builder = new QueryBuilder_1.default(user_model_1.UserModel.find(), query);
    const usersQuery = builder
        .search(searchableFields)
        .filter()
        .sort(['-createdAt'])
        .paginate()
        .fields();
    // const data = await usersQuery.modelQuery.lean();
    const meta = yield builder.getPaginationInfo();
    const data = yield usersQuery.modelQuery.lean();
    return { meta, data };
});
//get all users by admin
const getSubAdminsFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield user_model_1.UserModel.find({ role: user_1.USER_ROLES.ADMIN }).lean();
    if (!data) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "No Sub Admin found!");
    }
    return { data };
});
//get all users through aggregation by admin
const getUsersAggregationFromDB = (filterOptions, paginationOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm = "" } = filterOptions, otherFilters = __rest(filterOptions, ["searchTerm"]);
    const { page = 1, limit = 10 } = paginationOptions;
    const skip = (page - 1) * limit;
    const searchableFields = ['name', 'email', 'location', 'contact'];
    const matchConditions = {};
    // Add `$or` condition if `searchTerm` is provided
    if (searchTerm) {
        matchConditions.$or = searchableFields.map((field) => ({
            [field]: { $regex: searchTerm, $options: 'i' },
        }));
    }
    const [result] = yield user_model_1.UserModel.aggregate([
        {
            $match: {
            // status: "active",
            }, // Don’t forget to apply your matchConditions here!
        },
        {
            $group: {
                _id: "$role",
                count: { $sum: 1 },
                users: { $push: "$_id" }
            }
        },
        {
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
        },
        {
            $addFields: {
                total: { $ifNull: [{ $arrayElemAt: ["$countData.total", 0] }, 0] },
                limit: limit,
                page: page,
                totalPage: {
                    $ceil: { $divide: [{ $ifNull: [{ $arrayElemAt: ["$countData.total", 0] }, 0] }, limit] }
                }
            }
        },
        {
            $project: {
                data: 1,
                pagination: {
                    total: "$total",
                    limit: "$limit",
                    page: "$page",
                    totalPage: "$totalPage",
                }
            }
        }
    ]);
    const meta = (result === null || result === void 0 ? void 0 : result.pagination) || {
        total: 0,
        limit,
        page,
        totalPage: 0,
    };
    return {
        meta,
        data: (result === null || result === void 0 ? void 0 : result.data) || [],
    };
});
// update profile to db
const updateProfileToDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = user;
    const isExistUser = yield user_model_1.UserModel.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    if (isExistUser.role === user_1.USER_ROLES.PROVIDER) {
        const isExistTempUser = yield userTemp_model_1.UserTempModel.findOne({ ref: id });
        if (isExistTempUser) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "You have already approval request!");
        }
        const { name, contact, countryCode, location, image } = payload; //email, role, password can't be updated here.
        const data = {
            ref: id,
            name: name !== null && name !== void 0 ? name : isExistUser.name,
            email: isExistUser.email,
            contact: contact !== null && contact !== void 0 ? contact : isExistUser.contact,
            countryCode: countryCode !== null && countryCode !== void 0 ? countryCode : isExistUser.countryCode,
            location: location !== null && location !== void 0 ? location : isExistUser.location,
            image: image !== null && image !== void 0 ? image : isExistUser.image
        };
        const testUser = yield userTemp_model_1.UserTempModel.create(data);
        yield user_model_1.UserModel.findByIdAndUpdate(isExistUser._id, { $set: { isModify: true } }, { new: true });
        return testUser;
    }
    else {
        //unlink file here
        if ((payload === null || payload === void 0 ? void 0 : payload.image) && (isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.image)) {
            (0, unlinkFile_1.unlinkFile)(isExistUser.image);
        }
        const { email, password, role } = payload, newPayload = __rest(payload, ["email", "password", "role"]); //email, role, password can't be updated here.
        const updateDoc = yield user_model_1.UserModel.findOneAndUpdate({ _id: id }, newPayload, {
            new: true,
        });
        return updateDoc;
    }
});
// update profile to db
const updateProfileImageToDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = user;
    const isExistUser = yield user_model_1.UserModel.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    if ((payload === null || payload === void 0 ? void 0 : payload.image) && (isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.image)) {
        (0, unlinkFile_1.unlinkFile)(isExistUser.image);
    }
    const { email, password, role } = payload, newPayload = __rest(payload, ["email", "password", "role"]);
    const updateDoc = yield user_model_1.UserModel.findOneAndUpdate({ _id: id }, newPayload, {
        new: true,
    });
    return updateDoc;
});
// approve update profile to db
const approveUpdateProfileToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield userTemp_model_1.UserTempModel.findOne({ ref: id });
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    const isOriginalUser = yield user_model_1.UserModel.findOne({ _id: isExistUser.ref });
    if (!isOriginalUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Original User doesn't exist!");
    }
    isExistUser.image && isOriginalUser.image && (0, unlinkFile_1.unlinkFile)(isOriginalUser.image);
    const { name, email, contact, countryCode, location, image } = isExistUser;
    const updateUser = yield user_model_1.UserModel.findOneAndUpdate({ _id: isExistUser.ref }, { name, email, contact, countryCode, location, image }, {
        new: true,
    });
    yield user_model_1.UserModel.findByIdAndUpdate(id, { $set: { isModify: false } }, { new: true });
    yield userTemp_model_1.UserTempModel.findOneAndDelete({ ref: id });
    return updateUser;
});
// delete update profile
const deleteUpdateProfileToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield userTemp_model_1.UserTempModel.findOneAndDelete({ ref: id });
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    isExistUser.image && (0, unlinkFile_1.unlinkFile)(isExistUser.image);
    yield user_model_1.UserModel.findByIdAndUpdate(id, { $set: { isModify: false } }, { new: true });
    return isExistUser;
});
// update user status to db by admin
const updateUserStatusToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user exists
    const isExistUser = yield user_model_1.UserModel.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    // Update user status
    const result = yield user_model_1.UserModel.findByIdAndUpdate(id, { isActive: !(isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.isActive) }, { new: true });
    return result;
});
// delete user from db
const deleteUserFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield user_model_1.UserModel.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    try {
        const result = yield user_model_1.UserModel.findByIdAndUpdate(id, { $set: { isDeleted: !(isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.isDeleted) } }, { new: true });
        return result;
    }
    catch (error) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Oops! Failed to delete user.");
    }
});
// active block user from db
const activeBlockUserFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield user_model_1.UserModel.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    try {
        const result = yield user_model_1.UserModel.findByIdAndUpdate(id, { $set: { isActive: !(isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.isActive) } }, { new: true });
        return { message: `${(isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.isActive) ? "Blocked" : "Active"} User Successfully`, data: result };
    }
    catch (error) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Oops! Failed to Active/Block user.");
    }
});
// give credit to user by admin
const giveCreditFromDB = (id, credits) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield user_model_1.UserModel.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    try {
        const result = yield user_model_1.UserModel.findByIdAndUpdate(id, { $set: { credits: (isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.credits) + Number(credits) } }, { new: true });
        const payload = { user: isExistUser._id, credits: Number(credits) };
        const resCredits = yield credits_model_1.CreditsModel.create(payload);
        if (!resCredits) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to calculate credits!");
        }
        return { message: `${credits} send to ${isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.name} Successfully`, data: result };
    }
    catch (error) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Oops! Failed to send credits.");
    }
});
// give credit to user by admin
const getRsdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield user_model_1.UserModel.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    return { rsd: yield rsdCreditsConver_1.RsdCreditsTransformation.creditsToRsd(isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.credits) };
});
//hard delete users from db after 30 days by Scheduler
const hardDeleteUsersFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    try {
        // Find users soft-deleted more than 45 days ago
        const users = yield user_model_1.UserModel.find({
            isDeleted: true,
            updatedAt: { $lt: cutoff }
        });
        for (const user of users) {
            // Delete related services first
            // await ServiceModel.deleteMany({ userId: user._id });
            // Delete user image if exists
            if (user === null || user === void 0 ? void 0 : user.image) {
                (0, unlinkFile_1.unlinkFile)(user.image);
            }
            // Delete the user
            yield user_model_1.UserModel.deleteOne({ _id: user._id });
            logger_1.logger.info(`✅ Deleted user ${user._id} and their services`);
        }
    }
    catch (error) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Oops! Failed to delete user.");
    }
});
//get total users & providers from db
const totalUsersProviderFromDB = (year) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield user_model_1.UserModel.aggregate([
        {
            $match: {
                $expr: {
                    $eq: [{ $year: "$createdAt" }, year],
                },
            },
        },
        {
            $group: {
                _id: null,
                totalUsers: {
                    $sum: {
                        $cond: [{ $eq: ["$role", "USER"] }, 1, 0],
                    },
                },
                totalProviders: {
                    $sum: {
                        $cond: [{ $eq: ["$role", "PROVIDER"] }, 1, 0],
                    },
                },
            },
        },
        {
            $addFields: {
                total: { $add: ["$totalUsers", "$totalProviders"] },
            },
        },
        {
            $project: {
                _id: 0,
                total: 1,
                totalUsers: 1,
                totalProviders: 1,
            },
        },
    ]);
    return data[0] || { total: 0, totalUsers: 0, totalProviders: 0 };
});
//withdraw amount to provider account from admin account
const withdrawFromDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const User = yield user_model_1.UserModel.findById(user.id)
            .select("+stripeAccountInfo")
            .session(session)
            .lean();
        if (!User) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Withdraw - User not found");
        }
        // ✅ CASE 1: Account ready to withdraw
        if (((_a = User === null || User === void 0 ? void 0 : User.stripeAccountInfo) === null || _a === void 0 ? void 0 : _a.stripeAccountId) &&
            ((_b = User === null || User === void 0 ? void 0 : User.stripeAccountInfo) === null || _b === void 0 ? void 0 : _b.stripeLoginUrl) &&
            ((_c = User === null || User === void 0 ? void 0 : User.stripeAccountInfo) === null || _c === void 0 ? void 0 : _c.isAccountReady)) {
            const userBalance = yield rsdCreditsConver_1.RsdCreditsTransformation.creditsToRsd(User === null || User === void 0 ? void 0 : User.credits);
            const balance = yield stripe_config_1.default.balance.retrieve();
            const availableBalance = ((_e = (_d = balance.available) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.amount) || 0;
            if (availableBalance < userBalance * 100) {
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Insufficient platform funds to make transfer.");
            }
            const transfer = yield stripe_config_1.default.transfers.create({
                amount: userBalance * 100,
                currency: "usd",
                destination: (_f = User === null || User === void 0 ? void 0 : User.stripeAccountInfo) === null || _f === void 0 ? void 0 : _f.stripeAccountId,
            });
            if (!transfer) {
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to transfer funds to connected account.");
            }
            yield user_model_1.UserModel.updateOne({ _id: user.id }, { $set: { credits: 0 } }, { session });
            yield session.commitTransaction();
            session.endSession();
            return {
                message: `${userBalance} transferred to Stripe account successfully!`,
            };
        }
        // ✅ CASE 2: Account exists but not ready
        if (((_g = User === null || User === void 0 ? void 0 : User.stripeAccountInfo) === null || _g === void 0 ? void 0 : _g.stripeAccountId) &&
            ((_h = User === null || User === void 0 ? void 0 : User.stripeAccountInfo) === null || _h === void 0 ? void 0 : _h.stripeLoginUrl) &&
            !((_j = User === null || User === void 0 ? void 0 : User.stripeAccountInfo) === null || _j === void 0 ? void 0 : _j.isAccountReady)) {
            const accountLink = yield stripe_config_1.default.accountLinks.create({
                account: User.stripeAccountInfo.stripeAccountId,
                refresh_url: "https://nk6567-dashboard.vercel.app/account-create-failed",
                return_url: "https://nk6567-dashboard.vercel.app/account-create-successful",
                type: "account_onboarding",
                // collect: 'eventually_due', // optional
            });
            if (!accountLink.url) {
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to create Stripe onboarding link.");
            }
            yield user_model_1.UserModel.findByIdAndUpdate(user.id, {
                $set: {
                    "stripeAccountInfo.stripeLoginUrl": accountLink.url,
                },
            }, { session });
            yield session.commitTransaction();
            session.endSession();
            return {
                message: "Created Stripe connected account onboarding link!",
                url: accountLink.url,
            };
        }
        // ✅ CASE 3: No Stripe account yet → create one
        const createAccount = yield stripe_config_1.default.accounts.create({
            type: "express",
            country: "US",
            email: User === null || User === void 0 ? void 0 : User.email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            business_profile: {
                name: User === null || User === void 0 ? void 0 : User.name,
                support_email: User === null || User === void 0 ? void 0 : User.email,
                support_phone: User === null || User === void 0 ? void 0 : User.contact,
                url: "https://nk6567-dashboard.vercel.app",
            },
            business_type: "individual",
            individual: {
                first_name: User === null || User === void 0 ? void 0 : User.name,
                email: User === null || User === void 0 ? void 0 : User.email,
            },
        });
        const accountLink = yield stripe_config_1.default.accountLinks.create({
            account: createAccount.id,
            refresh_url: "https://nk6567-dashboard.vercel.app/account-create-failed",
            return_url: "https://nk6567-dashboard.vercel.app/account-create-successful",
            type: "account_onboarding",
        });
        if (!accountLink.url) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to create Stripe onboarding link.");
        }
        yield user_model_1.UserModel.findByIdAndUpdate(user.id, {
            $set: {
                "stripeAccountInfo.stripeAccountId": createAccount.id,
                "stripeAccountInfo.stripeLoginUrl": accountLink.url,
                "stripeAccountInfo.isAccountReady": false,
            },
        }, { session });
        yield session.commitTransaction();
        session.endSession();
        return {
            message: "Created new Stripe connected account!",
            url: accountLink.url,
        };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        console.error("withdrawFromDB error:", error);
        throw error;
    }
});
exports.UserService = {
    createUserToDB,
    createUsersToDB,
    getUserProfileFromDB,
    getUserFromDB,
    getEditedUserFromDB,
    getUsersFromDB,
    updateProfileToDB,
    updateProfileImageToDB,
    updateUserStatusToDB,
    deleteUserFromDB,
    hardDeleteUsersFromDB,
    getUsersAggregationFromDB,
    approveUpdateProfileToDB,
    deleteUpdateProfileToDB,
    activeBlockUserFromDB,
    giveCreditFromDB,
    totalUsersProviderFromDB,
    createSubAdminToDB,
    deleteSubAdminFromDB,
    getSubAdminsFromDB,
    getRsdFromDB,
    withdrawFromDB
};
