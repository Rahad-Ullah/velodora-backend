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
exports.RevenueService = void 0;
const revenue_model_1 = require("./revenue.model");
const user_model_1 = require("../user/user.model");
const credits_model_1 = require("../credits/credits.model");
// get revenues yearly summary
const getRevenuesFromDB = (year) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield revenue_model_1.RevenueModel.aggregate([
        // 1️⃣ Match by selected year
        {
            $match: {
                $expr: {
                    $eq: [{ $year: "$createdAt" }, year],
                },
            },
        },
        // 2️⃣ Group by month and sum credits
        {
            $group: {
                _id: { month: { $month: "$createdAt" } },
                totalCredits: { $sum: "$revenue" },
            },
        },
        // 3️⃣ Sort by month ascending
        {
            $sort: { "_id.month": 1 },
        },
    ]);
    // 4️⃣ Map Mongo months (1–12) to names & ensure all months exist
    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    // initialize array with all months (default 0 credits)
    const result = monthNames.map((month, index) => {
        const monthData = data.find((item) => item._id.month === index + 1);
        return {
            month,
            revenue: monthData ? monthData.totalCredits : 0,
        };
    });
    return { year, data: result };
});
// get revenues yearly summary
const generalStateFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const userDatas = yield user_model_1.UserModel.aggregate([
        {
            $group: {
                _id: null,
                totalUsers: {
                    $sum: {
                        $cond: [{ $eq: ["$role", "USER"] }, 1, 0],
                    },
                },
                totalProviders: {
                    $sum: {
                        $cond: [{ $eq: ["$role", "PROVIDER"] }, 1, 0],
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                totalUsers: 1,
                totalProviders: 1,
            },
        },
    ]);
    const revenueDatas = yield revenue_model_1.RevenueModel.aggregate([
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$revenue" },
            },
        },
        {
            $project: {
                _id: 0,
                totalRevenue: 1,
            },
        },
    ]);
    const creditDatas = yield credits_model_1.CreditsModel.aggregate([
        {
            $group: {
                _id: null,
                totalCredits: { $sum: "$credits" },
            },
        },
        {
            $project: {
                _id: 0,
                totalCredits: 1,
            },
        },
    ]);
    const result = {
        totalUser: ((_a = userDatas[0]) === null || _a === void 0 ? void 0 : _a.totalUsers) || 0,
        totalProvider: ((_b = userDatas[0]) === null || _b === void 0 ? void 0 : _b.totalProviders) || 0,
        distributedCredit: ((_c = creditDatas[0]) === null || _c === void 0 ? void 0 : _c.totalCredits) || 0,
        totalRevenue: ((_d = revenueDatas[0]) === null || _d === void 0 ? void 0 : _d.totalRevenue) || 0
    };
    return { data: result };
});
exports.RevenueService = {
    getRevenuesFromDB,
    generalStateFromDB
};
