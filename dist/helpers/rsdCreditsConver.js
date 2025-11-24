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
exports.RsdCreditsTransformation = void 0;
const system_service_1 = require("../app/modules/system/system.service");
function rsdToCredits(rsd) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const system = yield system_service_1.SystemService.getSystemFromDB();
        return rsd * ((_a = system === null || system === void 0 ? void 0 : system.data) === null || _a === void 0 ? void 0 : _a.oneRsdToCredits);
    });
}
function creditsToRsd(credits) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const system = yield system_service_1.SystemService.getSystemFromDB();
        return credits / ((_a = system === null || system === void 0 ? void 0 : system.data) === null || _a === void 0 ? void 0 : _a.oneRsdToCredits);
    });
}
exports.RsdCreditsTransformation = { rsdToCredits, creditsToRsd };
