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
exports.NotificationServices = void 0;
const mongoose_1 = require("mongoose");
const notification_model_1 = require("./notification.model");
const notificationHelper_1 = require("../../../helpers/notificationHelper");
const notification_constants_1 = require("./notification.constants");
// ----------------- get notification by user id ----------------- //
const getUserNotificationAmountFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_model_1.NotificationModel.countDocuments({
        receiver: new mongoose_1.Types.ObjectId(userId),
        isRead: false
    });
    return { result };
});
const getUnreadMessageAmountFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_model_1.NotificationModel.countDocuments({
        receiver: new mongoose_1.Types.ObjectId(userId),
        type: notification_constants_1.NOTIFICATION_TYPE.MESSAGE,
        isRead: false
    });
    return { result };
});
// ----------------- get notification by user id ----------------- //
const getUserNotificationFromDB = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const result = yield notification_model_1.NotificationModel.aggregate([
        {
            $match: {
                receiver: new mongoose_1.Types.ObjectId(userId),
            },
        },
        {
            $facet: {
                // 1️⃣ Main data: all notifications (read + unread)
                notifications: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'referenceId',
                            foreignField: '_id',
                            as: 'referenceId',
                            pipeline: [
                                { $project: { name: 1, email: 1, image: 1, contact: 1 } }
                            ]
                        }
                    },
                    { $unwind: { path: '$referenceId', preserveNullAndEmptyArrays: true } },
                    // 🧠 Sort unread first, then by newest date
                    { $sort: { isRead: 1, createdAt: -1 } },
                    { $skip: skip },
                    { $limit: limit }
                ],
                // 2️⃣ Count total unread notifications
                unreadCount: [
                    { $match: { isRead: false } },
                    { $count: 'count' }
                ],
                // 3️⃣ Count total notifications
                totalCount: [
                    { $count: 'count' }
                ]
            }
        }
    ]);
    // Extract data safely
    const notifications = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.notifications) || [];
    const unreadNotifications = ((_c = (_b = result[0]) === null || _b === void 0 ? void 0 : _b.unreadCount[0]) === null || _c === void 0 ? void 0 : _c.count) || 0;
    const total = ((_e = (_d = result[0]) === null || _d === void 0 ? void 0 : _d.totalCount[0]) === null || _e === void 0 ? void 0 : _e.count) || 0;
    const totalPage = Math.ceil(total / limit);
    return {
        notifications,
        pagination: {
            page,
            limit,
            totalPage,
            total,
            unreadNotifications,
        },
    };
});
// ----------------- mark all notifications as read -----------------
const readUserNotificationToDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield notification_model_1.NotificationModel.bulkWrite([
        {
            updateMany: {
                filter: { receiver: new mongoose_1.Types.ObjectId(userId), isRead: false },
                update: { $set: { isRead: true } },
                upsert: false,
            },
        },
    ]);
    yield (0, notificationHelper_1.readNotifications)(userId);
    return true;
});
exports.NotificationServices = { getUserNotificationFromDB, readUserNotificationToDB, getUserNotificationAmountFromDB, getUnreadMessageAmountFromDB };
