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
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_codes_1 = require("http-status-codes");
const config_1 = __importDefault(require("../../../config"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const emailHelper_1 = require("../../../helpers/emailHelper");
const jwtHelper_1 = require("../../../helpers/jwtHelper");
const emailTemplate_1 = require("../../../shared/emailTemplate");
const generateOTP_1 = __importDefault(require("../../../util/generateOTP"));
const resetToken_model_1 = require("../resetToken/resetToken.model");
const user_model_1 = require("../user/user.model");
const cryptoToken_1 = __importDefault(require("../../../util/cryptoToken"));
//login
const loginUserFromDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, role } = payload;
    const isExistUser = yield user_model_1.UserModel.findOne({ email }).select('+password');
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    else if ((isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.role) !== role) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Role doesn't match!");
    }
    else if (!(isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.isActive)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User is blocked by admin!");
    }
    else if (isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.isDeleted) {
        const now = new Date();
        const expireAt = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (isExistUser.updatedAt < expireAt) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User is deleted, Please contact admin!");
        }
        else {
            yield user_model_1.UserModel.findByIdAndUpdate(isExistUser._id, { $set: { isDeleted: false } }, { new: true });
        }
    }
    //check match password
    if (password && !(yield user_model_1.UserModel.isMatchPassword(password, isExistUser.password))) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Password is incorrect!');
    }
    const jwtPayload = { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email };
    //create token
    const createToken = jwtHelper_1.jwtHelper.createToken(jwtPayload, config_1.default.jwt.jwt_secret, config_1.default.jwt.jwt_expire_in);
    const refreshToken = jwtHelper_1.jwtHelper.createToken(jwtPayload, config_1.default.jwt.jwt_refresh_secret, config_1.default.jwt.jwt_refresh_expire_in);
    return { createToken, refreshToken, id: isExistUser._id };
});
//send otp
const sendOtpToDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield user_model_1.UserModel.findOne({ email }).select('+authentication');
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    // if (isExistUser?.authentication?.oneTimeCode) {
    //   const date = new Date();
    //   if (date < isExistUser.authentication?.expireAt) {
    //     throw new ApiError(
    //       StatusCodes.BAD_REQUEST,
    //       'Otp already sent, Please try after 3 minutes later'
    //     );
    //   }
    // }
    //send mail
    const otp = (0, generateOTP_1.default)();
    const value = {
        otp,
        email,
    };
    const otpEmailTemplate = emailTemplate_1.emailTemplate.sendOtp(value);
    emailHelper_1.emailHelper.sendEmail(otpEmailTemplate);
    //save to DB
    const authentication = {
        isSendOtp: true,
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 3 * 60 * 1000),
    };
    yield user_model_1.UserModel.updateOne({ email }, { $set: { authentication } });
});
//verify otp
const verifyOtpToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let message;
    let data = {};
    const email = payload === null || payload === void 0 ? void 0 : payload.email;
    const oneTimeCode = Number(payload === null || payload === void 0 ? void 0 : payload.oneTimeCode);
    const isExistUser = yield user_model_1.UserModel.findOne({ email }).select('+authentication');
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    if (!oneTimeCode) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Please check your email we send a code then  give the otp,');
    }
    if (((_a = isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.authentication) === null || _a === void 0 ? void 0 : _a.oneTimeCode) !== oneTimeCode) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Otp is incorrect, Please try again');
    }
    const date = new Date();
    if (date > ((_b = isExistUser.authentication) === null || _b === void 0 ? void 0 : _b.expireAt)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.OK, 'Otp already expired, Please try again');
    }
    yield user_model_1.UserModel.findOneAndUpdate({ _id: isExistUser._id }, {
        authentication: {
            isSendOtp: true,
            oneTimeCode: null,
            expireAt: null,
        },
    });
    //create token ;
    const createToken = (0, cryptoToken_1.default)();
    yield resetToken_model_1.ResetTokenModel.create({
        user: isExistUser._id,
        token: createToken,
        expireAt: new Date(Date.now() + 5 * 60000),
    });
    message =
        'Verification Successful: Please securely store and utilize this code for reset password';
    data = { resetPasswordToken: createToken };
    return { data, message };
});
//verify account
const verifyAccountToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let message;
    let data;
    const email = payload === null || payload === void 0 ? void 0 : payload.email;
    const oneTimeCode = Number(payload === null || payload === void 0 ? void 0 : payload.oneTimeCode);
    const isExistUser = yield user_model_1.UserModel.findOne({ email }).select('+authentication');
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    if (!oneTimeCode) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Please give the otp, check your email we send a code');
    }
    if (((_a = isExistUser.authentication) === null || _a === void 0 ? void 0 : _a.oneTimeCode) !== oneTimeCode) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You provided wrong otp');
    }
    const date = new Date();
    if (date > ((_b = isExistUser.authentication) === null || _b === void 0 ? void 0 : _b.expireAt)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.OK, 'Otp already expired, Please try again');
    }
    if (!isExistUser.verified) {
        yield user_model_1.UserModel.findOneAndUpdate({ _id: isExistUser._id }, { verified: true, authentication: { oneTimeCode: null, expireAt: null } });
    }
    else {
        yield user_model_1.UserModel.findOneAndUpdate({ _id: isExistUser._id }, {
            authentication: {
                isSendOtp: false,
                oneTimeCode: null,
                expireAt: null,
            },
        });
    }
    const createToken = jwtHelper_1.jwtHelper.createToken({ id: isExistUser._id, role: isExistUser.role, email: isExistUser.email }, config_1.default.jwt.jwt_secret, config_1.default.jwt.jwt_expire_in);
    data = { accessToken: createToken };
    message = 'Account verified successfully';
    return { data, message };
});
//reset password
const resetPasswordToDB = (token, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { newPassword, confirmPassword } = payload;
    //isExist token
    const isExistToken = yield resetToken_model_1.ResetTokenModel.isExistToken(token);
    if (!isExistToken) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'You are not authorized');
    }
    //user permission check
    const isExistUser = yield user_model_1.UserModel.findById(isExistToken.user).select('+authentication');
    if (!((_a = isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.authentication) === null || _a === void 0 ? void 0 : _a.isSendOtp)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "You don't have permission to change password. Please click again to 'Forgot Password'");
    }
    //validity check
    const isValid = yield resetToken_model_1.ResetTokenModel.isExpireToken(token);
    if (!isValid) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Token expired, Please click again to the forget password');
    }
    //check password
    if (newPassword !== confirmPassword) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "New password and Confirm password doesn't match!");
    }
    const hashPassword = yield bcrypt_1.default.hash(newPassword, Number(config_1.default.bcrypt_salt_rounds));
    const updateData = {
        password: hashPassword,
        authentication: {
            isSendOtp: false,
        },
    };
    const updatedUser = yield user_model_1.UserModel.findOneAndUpdate({ _id: isExistToken.user }, updateData);
    if (!updatedUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to Reset Password!');
    }
    const deleteToken = yield resetToken_model_1.ResetTokenModel.findByIdAndDelete(isExistToken._id);
    if (!deleteToken) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to delete token!');
    }
});
//change password
const changePasswordToDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { currentPassword, newPassword, confirmPassword } = payload;
    const isExistUser = yield user_model_1.UserModel.findById(user.id).select('+password');
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    //current password match
    if (currentPassword &&
        !(yield user_model_1.UserModel.isMatchPassword(currentPassword, isExistUser.password))) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Old password is incorrect');
    }
    //newPassword and current password
    if (currentPassword === newPassword) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Please give different password from current password');
    }
    //new password and confirm password check
    if (newPassword !== confirmPassword) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Password and Confirm password doesn't matched");
    }
    //hash password
    const hashPassword = yield bcrypt_1.default.hash(newPassword, Number(config_1.default.bcrypt_salt_rounds));
    const updateData = {
        password: hashPassword,
    };
    yield user_model_1.UserModel.findOneAndUpdate({ _id: user.id }, updateData, { new: true });
});
// Refresh token
const refreshTokenToDB = (token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Token not found');
    }
    const decoded = jwtHelper_1.jwtHelper.verifyToken(token, config_1.default.jwt.jwt_refresh_secret);
    const { email } = decoded;
    const activeUser = yield user_model_1.UserModel.findOne({ email, isActive: true });
    if (!activeUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found');
    }
    const jwtPayload = { id: activeUser._id, role: activeUser.role, email: activeUser.email };
    const accessToken = jwtHelper_1.jwtHelper.createToken(jwtPayload, config_1.default.jwt.jwt_secret, config_1.default.jwt.jwt_expire_in);
    return {
        accessToken,
        refreshToken: token,
    };
});
exports.AuthService = {
    verifyAccountToDB,
    verifyOtpToDB,
    loginUserFromDB,
    sendOtpToDB,
    resetPasswordToDB,
    changePasswordToDB,
    refreshTokenToDB,
};
