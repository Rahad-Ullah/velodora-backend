"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSlots = void 0;
const generateSlots = (startTime, endTime, duration) => {
    const slots = [];
    let start = new Date(startTime);
    const end = new Date(endTime);
    while (start.getTime() + duration * 60 * 1000 <= end.getTime()) {
        const slotStart = new Date(start); // clone
        const slotEnd = new Date(start.getTime() + duration * 60 * 1000);
        slots.push({ start: slotStart, end: slotEnd });
        // move to next slot
        start = slotEnd;
    }
    return slots;
};
exports.generateSlots = generateSlots;
