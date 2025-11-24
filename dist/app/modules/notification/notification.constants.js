"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOTIFICATION_TYPE = void 0;
var NOTIFICATION_TYPE;
(function (NOTIFICATION_TYPE) {
    NOTIFICATION_TYPE["ATTACHMENT"] = "Attachment";
    NOTIFICATION_TYPE["PAYMENT"] = "Payment";
    NOTIFICATION_TYPE["PENALTY"] = "Penalty";
    NOTIFICATION_TYPE["MESSAGE"] = "Message";
    NOTIFICATION_TYPE["CREDITS_GIFTED"] = "Credits Gifted";
    NOTIFICATION_TYPE["CONTACT_SUPPORT"] = "Contact & Support";
    NOTIFICATION_TYPE["BOOKING_STATUS"] = "Booking Status";
    NOTIFICATION_TYPE["SERVICE_STATUS"] = "Service Status";
    NOTIFICATION_TYPE["EDIT_PROVIDER"] = "Edit Request from Provider";
    NOTIFICATION_TYPE["NEW_PROVIDER"] = "New Provider Registered";
    NOTIFICATION_TYPE["REVIEW"] = "New Review";
})(NOTIFICATION_TYPE || (exports.NOTIFICATION_TYPE = NOTIFICATION_TYPE = {}));
