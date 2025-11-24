"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOOKING_PAYMENT_STATUS = exports.BOOKING_STATUS = void 0;
var BOOKING_STATUS;
(function (BOOKING_STATUS) {
    BOOKING_STATUS["PENDING"] = "Pending";
    BOOKING_STATUS["UPCOMING"] = "Upcoming";
    BOOKING_STATUS["COMPLETED"] = "Completed";
    BOOKING_STATUS["CANCELLED"] = "Canceled";
    BOOKING_STATUS["AUTO_CANCELLED"] = "Auto_Canceled";
})(BOOKING_STATUS || (exports.BOOKING_STATUS = BOOKING_STATUS = {}));
var BOOKING_PAYMENT_STATUS;
(function (BOOKING_PAYMENT_STATUS) {
    BOOKING_PAYMENT_STATUS["PAID"] = "Paid";
    BOOKING_PAYMENT_STATUS["UNPAID"] = "Unpaid";
})(BOOKING_PAYMENT_STATUS || (exports.BOOKING_PAYMENT_STATUS = BOOKING_PAYMENT_STATUS = {}));
