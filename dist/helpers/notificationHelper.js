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
Object.defineProperty(exports, "__esModule", { value: true });
exports.readNotifications = exports.sendNotifications = void 0;
const notification_model_1 = require("../app/modules/notification/notification.model");
// Send notification to user
const sendNotifications = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_model_1.NotificationModel.create(payload);
    //@ts-ignore
    const io = global.io;
    if (io) {
        io.emit(`getNotification::${payload === null || payload === void 0 ? void 0 : payload.receiver}`, result);
    }
    return result;
});
exports.sendNotifications = sendNotifications;
// Read notification from user
const readNotifications = (receiver) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const io = global.io;
    if (io) {
        io.emit(`readNotification::${receiver}`, "read");
    }
});
exports.readNotifications = readNotifications;
