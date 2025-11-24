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
exports.ContactSupportService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const contactSupport_model_1 = require("./contactSupport.model");
const mongoose_1 = require("mongoose");
const emailTemplate_1 = require("../../../shared/emailTemplate");
const emailHelper_1 = require("../../../helpers/emailHelper");
//create contact support
const createContactSupportToDB = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistContactSupport = yield contactSupport_model_1.ContactSupportModel.findOne({ user: new mongoose_1.Types.ObjectId(userId), isReply: false });
    if (isExistContactSupport) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Your already have pending contact support! Please wait for admin response to you mail!");
    }
    const newContactSupport = {
        user: new mongoose_1.Types.ObjectId(userId),
        sub: payload.sub,
        msg: payload.msg,
    };
    const res = yield contactSupport_model_1.ContactSupportModel.create(newContactSupport);
    if (!res) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Contact Support doesn't exist!");
    }
    return res;
});
// update contact support
const updateContactSupportToDB = (id, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield contactSupport_model_1.ContactSupportModel.findById(id).populate('user', 'email');
    if (!res) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Contact Support doesn't exist!");
    }
    if (res.isReply) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Already replied! Please Check through your email");
    }
    // Make sure user is properly populated
    if (!res.user || typeof res.user === 'string' || !('email' in res.user)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User information not available");
    }
    const values = {
        email: res.user.email,
        sub: res.sub,
        msg: res.msg,
        reply: reply,
    };
    const createAccountTemplate = emailTemplate_1.emailTemplate.contactSupport(values);
    emailHelper_1.emailHelper.sendEmail(createAccountTemplate);
    res.reply = reply;
    res.isReply = true;
    yield res.save();
    return res;
});
// get contact support
const getContactSupportToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield contactSupport_model_1.ContactSupportModel.findById(id).populate('user', 'name email contact location');
    if (!res) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Contact Support doesn't exist!");
    }
    return res;
});
// get contact support with pagination
const getContactSupportsToDB = (limit, pageNumber, status) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const skip = (pageNumber - 1) * limit;
    const isReply = status === 'solved' ? true : false;
    const pipeline = [];
    if (status === 'pending' || status === 'solved') {
        pipeline.push({ $match: { isReply: isReply } });
    }
    pipeline.push({ $sort: { createdAt: -1 } }, {
        $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
            pipeline: [
                {
                    $project: {
                        name: 1,
                        email: 1,
                        contact: 1,
                        location: 1,
                    },
                },
            ],
        },
    }, { $unwind: '$user' });
    pipeline.push({
        $facet: {
            data: [
                { $skip: skip },
                { $limit: limit },
            ],
            totalCount: [
                { $count: 'count' }
            ],
        },
    }, {
        $unwind: {
            path: '$totalCount',
            preserveNullAndEmptyArrays: true,
        },
    }, {
        $project: {
            data: 1,
            total: '$totalCount.count',
        },
    });
    const result = yield contactSupport_model_1.ContactSupportModel.aggregate(pipeline);
    const total = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
    const data = ((_b = result[0]) === null || _b === void 0 ? void 0 : _b.data) || [];
    return {
        meta: {
            total,
            page: pageNumber,
            limit,
            totalPages: Math.ceil(total / limit),
        },
        data,
    };
});
exports.ContactSupportService = {
    createContactSupportToDB,
    updateContactSupportToDB,
    getContactSupportToDB,
    getContactSupportsToDB
};
