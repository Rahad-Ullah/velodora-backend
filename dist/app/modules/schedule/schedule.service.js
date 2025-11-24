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
exports.ScheduleService = exports.getSchedulesByDateToDB = exports.getSchedulesToDB = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const schedule_model_1 = require("./schedule.model");
const generateSlots_1 = require("../../../util/generateSlots");
const mongoose_1 = __importDefault(require("mongoose"));
const provider_model_1 = require("../provider/provider.model");
//create schedule to db
const createScheduleToDB = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userDate = new Date(payload.date);
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);
    const userStartTime = new Date(payload.startTime);
    const currentTime = new Date();
    console.log("Current Date : ", currentDate);
    console.log("Current Time : ", currentTime);
    console.log("User Date : ", userDate);
    console.log("User startTime : ", userStartTime);
    if (userDate < currentDate) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Date must be greater than current date');
    }
    if (userStartTime <= currentTime) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Start time must be greater than current date');
    }
    if (payload.startTime >= payload.endTime) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'End time must be greater than start time');
    }
    const provider = yield provider_model_1.ProviderModel.findOne({ user: userId });
    if (!provider) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Provider not found');
    }
    const isExistSchedule = yield schedule_model_1.ScheduleModel.findOne({
        provider: provider._id,
        date: payload.date,
    });
    if (isExistSchedule && (isExistSchedule.count > 0)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Schedule already exists And Have bookings = ${isExistSchedule.count}`);
    }
    const available_slots = (0, generateSlots_1.generateSlots)(payload.startTime, payload.endTime, payload.duration);
    let schedule;
    if (isExistSchedule && (isExistSchedule.count <= 0)) {
        isExistSchedule.startTime = payload.startTime;
        isExistSchedule.endTime = payload.endTime;
        isExistSchedule.duration = payload.duration;
        isExistSchedule.available_slots = available_slots;
        schedule = yield isExistSchedule.save();
    }
    else {
        schedule = yield schedule_model_1.ScheduleModel.create(Object.assign(Object.assign({}, payload), { provider: provider._id, available_slots }));
    }
    ;
    return { data: schedule };
});
//get schedule to db
const getScheduleToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const schedule = yield schedule_model_1.ScheduleModel.findById(id);
    if (!schedule) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Schedule not found');
    }
    return { data: schedule };
});
//get schedule to db
const openCloseScheduleToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const schedule = yield schedule_model_1.ScheduleModel.findById(id);
    if (!schedule) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Schedule not found');
    }
    schedule.isActive = !schedule.isActive;
    yield schedule.save();
    return { data: schedule };
});
//get schedules to db
const getSchedulesToDB = (providerId, date) => __awaiter(void 0, void 0, void 0, function* () {
    const provider = yield provider_model_1.ProviderModel.findOne({ user: providerId });
    if (!provider) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Provider not found");
    }
    // 🕒 Handle date without any library
    let startDate;
    let endDate;
    if (date) {
        const d = new Date(date);
        // Normalize to start of the day (00:00:00)
        startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
        // End date = start date + 7 days at 23:59:59
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
        endDate.setHours(23, 59, 59, 999);
    }
    else {
        const today = new Date();
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
        endDate.setHours(23, 59, 59, 999);
    }
    const schedules = yield schedule_model_1.ScheduleModel.aggregate([
        {
            $match: {
                provider: new mongoose_1.default.Types.ObjectId(provider._id),
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $lookup: {
                from: "providers",
                localField: "provider",
                foreignField: "_id",
                as: "provider",
                pipeline: [{ $match: { ref: { $exists: false } } }]
            }
        },
        { $unwind: "$provider" },
        {
            $project: {
                date: 1,
                startTime: 1,
                endTime: 1,
                duration: 1,
                count: 1,
                isActive: 1,
                // "provider._id": 1,
                // "provider.name": 1
            }
        },
        { $sort: { date: 1, startTime: 1 } }
    ]);
    if (!schedules || schedules.length === 0) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Schedules not found for the given period");
    }
    return { data: schedules };
});
exports.getSchedulesToDB = getSchedulesToDB;
//get schedule by date to db
const getSchedulesByDateToDB = (providerId, date) => __awaiter(void 0, void 0, void 0, function* () {
    const provider = yield provider_model_1.ProviderModel.findOne({ _id: providerId });
    if (!provider) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Provider not found");
    }
    // 🕒 Handle date safely (default to today if no date is provided)
    const d = date ? new Date(date) : new Date();
    const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
    const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0);
    const schedules = yield schedule_model_1.ScheduleModel.aggregate([
        {
            $match: {
                provider: provider._id,
                date: {
                    $gte: startOfDay,
                    $lt: endOfDay
                }
            }
        }
    ]);
    if (!schedules || schedules.length <= 0) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Schedule not found for the given date");
    }
    return { data: schedules[0] };
});
exports.getSchedulesByDateToDB = getSchedulesByDateToDB;
exports.ScheduleService = {
    createScheduleToDB,
    getScheduleToDB,
    getSchedulesToDB: exports.getSchedulesToDB,
    openCloseScheduleToDB,
    getSchedulesByDateToDB: exports.getSchedulesByDateToDB,
};
