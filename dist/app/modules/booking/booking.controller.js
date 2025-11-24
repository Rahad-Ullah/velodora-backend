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
exports.BookingController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const booking_service_1 = require("./booking.service");
//create service controller
const stripePayment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield booking_service_1.BookingService.stripePaymentToDB();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Payment success",
        data: result
    });
}));
//create service controller
const createBooking = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user.id;
    const result = yield booking_service_1.BookingService.createBookingToDB(Object.assign(Object.assign({}, req.body), { user }));
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result.message,
        data: result.data,
    });
}));
//Accept Booking controller
const completeBooking = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const providerId = req.user.id;
    const result = yield booking_service_1.BookingService.completeBookingToDB(userId, providerId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result,
    });
}));
//Accept Booking controller
const acceptBooking = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const id = req.params.id;
    const result = yield booking_service_1.BookingService.acceptBookingToDB(id, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result,
    });
}));
//Cancel Booking controller
const cancelBooking = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const id = req.params.id;
    const result = yield booking_service_1.BookingService.cancelBookingToDB(id, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result,
    });
}));
//Get Bookings controller
const getOverview = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = { year: Number(req.query.year), month: Number(req.query.month), day: Number(req.query.day) };
    const result = yield booking_service_1.BookingService.getOverviewFromDB(req.user.id, filter);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result,
    });
}));
//Get Bookings controller
const getBooking = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield booking_service_1.BookingService.getBookingToDB(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result,
    });
}));
//Get Bookings controller
const getBookings = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.id;
    const result = yield booking_service_1.BookingService.getBookingsToDB(id, req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result === null || result === void 0 ? void 0 : result.data,
        pagination: result === null || result === void 0 ? void 0 : result.meta,
    });
}));
//Get Bookings controller
const getBookingsAllByAdmin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.id;
    const result = yield booking_service_1.BookingService.getBookingsForAdminFromDB(id, req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result === null || result === void 0 ? void 0 : result.data,
        pagination: result === null || result === void 0 ? void 0 : result.meta,
    });
}));
//Get Bookings download controller
const getBookingsDownload = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.id;
    const result = yield booking_service_1.BookingService.getBookingsDownloadDB(id, req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result === null || result === void 0 ? void 0 : result.data,
    });
}));
//Get Bookings controller
const getBookingsByAdmin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield booking_service_1.BookingService.getBookingsToDB(id, req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result.data,
        pagination: result.meta,
    });
}));
exports.BookingController = { createBooking, getBookings, cancelBooking, acceptBooking, getBooking, completeBooking, getBookingsByAdmin, stripePayment, getOverview, getBookingsAllByAdmin, getBookingsDownload };
