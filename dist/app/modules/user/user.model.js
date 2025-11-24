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
exports.UserModel = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = require("mongoose");
const config_1 = __importDefault(require("../../../config"));
const user_1 = require("../../../enums/user");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const userSchema = new mongoose_1.Schema({
    role: {
        type: String,
        enum: Object.values(user_1.USER_ROLES),
        required: true,
    },
    name: {
        type: String,
    },
    image: {
        type: String,
        default: null,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    contact: {
        type: String,
    },
    countryCode: {
        type: String,
    },
    location: {
        type: String,
    },
    password: {
        type: String,
        select: 0,
        minlength: 6,
    },
    credits: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    verifiedService: {
        type: Boolean,
        default: false,
    },
    isService: {
        type: Boolean,
        default: false,
    },
    isModify: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    authentication: {
        type: {
            isSendOtp: {
                type: Boolean,
                default: false,
            },
            oneTimeCode: {
                type: Number,
                default: null,
            },
            expireAt: {
                type: Date,
                default: null,
            },
        },
        select: 0,
    },
    stripeAccountInfo: {
        type: {
            stripeAccountId: {
                type: String,
                default: null,
            },
            stripeLoginUrl: {
                type: String,
                default: null,
            },
            isAccountReady: {
                type: Boolean,
                default: false,
            },
        },
        select: 0,
    }
}, { timestamps: true });
//exist user check
userSchema.statics.isExistUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield exports.UserModel.findById(id);
    return isExist;
});
userSchema.statics.isExistUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield exports.UserModel.findOne({ email });
    return isExist;
});
//is match password
userSchema.statics.isMatchPassword = (password, hashPassword) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcrypt_1.default.compare(password, hashPassword);
});
// check user
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // check user
        const isExist = yield exports.UserModel.findOne({ email: this.email });
        if (isExist) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Email already exist!');
        }
        //password hash
        this.password = yield bcrypt_1.default.hash(this.password, Number(config_1.default.bcrypt_salt_rounds));
        next();
    });
});
exports.UserModel = (0, mongoose_1.model)('User', userSchema);
