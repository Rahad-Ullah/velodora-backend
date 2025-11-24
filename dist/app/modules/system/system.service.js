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
exports.SystemService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const system_model_1 = require("./system.model");
const logger_1 = require("../../../shared/logger");
const colors_1 = __importDefault(require("colors"));
// create system automatically to db
const createSystemAutoToDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const isExistSystem = yield system_model_1.SystemModel.findOne({});
    if (!isExistSystem) {
        const system = yield system_model_1.SystemModel.create({});
        if (!system) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'System not created');
        }
        logger_1.logger.info(colors_1.default.green('System created successfully'));
    }
});
// create system to db
const createSystemToDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const isExistSystem = yield system_model_1.SystemModel.findOne({});
    if (isExistSystem) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'System already exists');
    }
    const system = yield system_model_1.SystemModel.create({});
    if (!system) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'System not created');
    }
    return { message: 'System created successfully', data: system };
});
// get system to db
const getSystemFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const isExistSystem = yield system_model_1.SystemModel.findOne({});
    if (!isExistSystem) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'System not found');
    }
    return { message: 'System retrieved successfully', data: isExistSystem };
});
// update system to db
const updateSystemToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistSystem = yield system_model_1.SystemModel.findOne({});
    if (!isExistSystem) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'System not found');
    }
    if (payload.oneRsdToCredits) {
        isExistSystem.oneRsdToCredits = payload.oneRsdToCredits;
    }
    if (payload.penaltyTime) {
        isExistSystem.penaltyTime = payload.penaltyTime;
    }
    if (payload.weatherFee) {
        isExistSystem.weatherFee = {
            amount: payload.weatherFee,
            isOn: isExistSystem.weatherFee.isOn,
        };
    }
    if (payload.convenienceFee) {
        isExistSystem.convenienceFee = {
            amount: payload.convenienceFee,
            isOn: isExistSystem.convenienceFee.isOn,
        };
    }
    if (payload.arrivalFee) {
        isExistSystem.arrivalFee = {
            amount: payload.arrivalFee,
            isOn: isExistSystem.arrivalFee.isOn,
        };
    }
    const newSystem = yield isExistSystem.save();
    return { message: 'System updated successfully', data: newSystem };
});
// on/off system to db
const onOffSystemToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistSystem = yield system_model_1.SystemModel.findOne({});
    if (!isExistSystem) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'System not found');
    }
    if (payload === "weatherFee") {
        isExistSystem.weatherFee = {
            amount: isExistSystem.weatherFee.amount,
            isOn: !isExistSystem.weatherFee.isOn,
        };
    }
    if (payload === "convenienceFee") {
        isExistSystem.convenienceFee = {
            amount: isExistSystem.convenienceFee.amount,
            isOn: !isExistSystem.convenienceFee.isOn,
        };
    }
    if (payload === "arrivalFee") {
        isExistSystem.arrivalFee = {
            amount: isExistSystem.arrivalFee.amount,
            isOn: !isExistSystem.arrivalFee.isOn,
        };
    }
    const newSystem = yield isExistSystem.save();
    return { message: 'System on/off successfully', data: newSystem };
});
exports.SystemService = {
    createSystemAutoToDB,
    createSystemToDB,
    getSystemFromDB,
    updateSystemToDB,
    onOffSystemToDB
};
