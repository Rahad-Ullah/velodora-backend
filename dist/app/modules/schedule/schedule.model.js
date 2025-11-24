"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleModel = void 0;
const mongoose_1 = require("mongoose");
const ScheduleSchema = new mongoose_1.Schema({
    provider: { type: mongoose_1.Schema.Types.ObjectId, ref: "Provider", required: true },
    date: { type: Date, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    count: {
        type: Number,
        default: 0
    },
    available_slots: [
        {
            start: { type: Date, required: true },
            end: { type: Date, required: true }
        },
    ],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
exports.ScheduleModel = (0, mongoose_1.model)("Schedule", ScheduleSchema);
