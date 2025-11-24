"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_STATUS = exports.USER_ROLES = void 0;
var USER_ROLES;
(function (USER_ROLES) {
    USER_ROLES["SUPER_ADMIN"] = "SUPER_ADMIN";
    USER_ROLES["ADMIN"] = "ADMIN";
    USER_ROLES["USER"] = "USER";
    USER_ROLES["PROVIDER"] = "PROVIDER";
})(USER_ROLES || (exports.USER_ROLES = USER_ROLES = {}));
var USER_STATUS;
(function (USER_STATUS) {
    USER_STATUS["pending"] = "pending";
    USER_STATUS["active"] = "active";
    USER_STATUS["blocked"] = "blocked";
    USER_STATUS["delete"] = "delete";
})(USER_STATUS || (exports.USER_STATUS = USER_STATUS = {}));
