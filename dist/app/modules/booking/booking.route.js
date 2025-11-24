"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const booking_controller_1 = require("./booking.controller");
const booking_validation_1 = require("./booking.validation");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const router = express_1.default.Router();
router
    .route('/')
    .get((0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.PROVIDER), booking_controller_1.BookingController.getBookings)
    .post((0, auth_1.default)(user_1.USER_ROLES.USER), (0, validateRequest_1.default)(booking_validation_1.BookingValidation.createBookingZodSchema), booking_controller_1.BookingController.createBooking);
router.patch('/complete-booking/:id', (0, auth_1.default)(user_1.USER_ROLES.PROVIDER), booking_controller_1.BookingController.completeBooking);
router.get('/overview', (0, auth_1.default)(user_1.USER_ROLES.PROVIDER), booking_controller_1.BookingController.getOverview);
router.get('/order-history/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), booking_controller_1.BookingController.getBookingsByAdmin);
router.get('/order-history-all', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), booking_controller_1.BookingController.getBookingsAllByAdmin);
router.get('/order-history-all-download', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), booking_controller_1.BookingController.getBookingsDownload);
router.post('/stripe-payment', booking_controller_1.BookingController.stripePayment);
router
    .route('/:id')
    .get((0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.PROVIDER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), booking_controller_1.BookingController.getBooking)
    .patch((0, auth_1.default)(user_1.USER_ROLES.PROVIDER), booking_controller_1.BookingController.acceptBooking)
    .delete((0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.PROVIDER), booking_controller_1.BookingController.cancelBooking);
exports.BookingRoutes = router;
