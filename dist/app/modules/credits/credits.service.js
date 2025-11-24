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
exports.CreditsService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const credits_model_1 = require("./credits.model");
//create sub category
const createCreditToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield credits_model_1.CreditsModel.create(payload);
    if (!res) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to create credits!");
    }
    return { data: res };
});
// get credits yearly summary
const getCreditsFromDB = (year) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield credits_model_1.CreditsModel.aggregate([
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
                totalCredits: { $sum: "$credits" },
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
            credits: monthData ? monthData.totalCredits : 0,
        };
    });
    return { year, data: result };
});
exports.CreditsService = {
    createCreditToDB,
    getCreditsFromDB
};
