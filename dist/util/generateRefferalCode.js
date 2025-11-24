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
exports.generateUniqueReferralCode = generateUniqueReferralCode;
// utils/referralGenerator.ts
const nanoid_1 = require("nanoid");
const referral_model_1 = require("../app/modules/referral/referral.model");
// Generate unique code and ensure DB uniqueness
function generateUniqueReferralCode() {
    return __awaiter(this, void 0, void 0, function* () {
        let code;
        let exists = true;
        while (exists) {
            code = (0, nanoid_1.nanoid)(8).toUpperCase(); // Example: "X1Y2Z3AB"
            exists = (yield referral_model_1.ReferralModel.findOne({ code })) ? true : false; // check in DB
        }
        return code;
    });
}
