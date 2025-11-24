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
exports.ScheduleController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const schedule_service_1 = require("./schedule.service");
//create service controller
const createSchedule = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield schedule_service_1.ScheduleService.createScheduleToDB(req.user.id, {
        date: req.body.date,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        duration: req.body.duration,
    });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result.data,
    });
}));
//create service controller
const openCloseSchedule = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield schedule_service_1.ScheduleService.openCloseScheduleToDB(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result.data,
    });
}));
//create service controller
const getSchedule = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield schedule_service_1.ScheduleService.getScheduleToDB(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result.data,
    });
}));
//create service controller
const getProviderSchedules = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const providerId = req.user.id;
    const result = yield schedule_service_1.ScheduleService.getSchedulesToDB(req.params.id, req.query.date);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result.data,
    });
}));
//create service controller
const getSchedulesDate = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const providerId = req.user.id;
    const result = yield schedule_service_1.ScheduleService.getSchedulesByDateToDB(req.params.id, req.query.date);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result.data,
    });
}));
//create service controller
const getSchedules = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const providerId = req.user.id;
    const result = yield schedule_service_1.ScheduleService.getSchedulesToDB(req.user.id, req.query.date);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result.data,
    });
}));
exports.ScheduleController = { createSchedule, getSchedule, getSchedules, getProviderSchedules, openCloseSchedule, getSchedulesDate };
