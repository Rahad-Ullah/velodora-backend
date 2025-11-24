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
exports.handleStripeConnectedAccount = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = require("../app/modules/user/user.model");
const stripe_config_1 = __importDefault(require("../app/config/stripe.config"));
const handleStripeConnectedAccount = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("handleStripeConnectedAccount---------------", data);
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const email = data === null || data === void 0 ? void 0 : data.email;
        if (!email) {
            throw new Error('Connected account email not found');
        }
        const user = yield user_model_1.UserModel.findOne({ email });
        if (!user) {
            throw new Error('Connected account user not found');
        }
        const isAccountReady = data.details_submitted &&
            data.charges_enabled &&
            data.payouts_enabled &&
            !((_a = data.requirements) === null || _a === void 0 ? void 0 : _a.disabled_reason);
        const loginUrl = yield stripe_config_1.default.accounts.createLoginLink(data.id);
        yield user_model_1.UserModel.findOneAndUpdate({ email }, { stripeAccountInfo: { stripeAccountId: data.id, stripeLoginUrl: loginUrl.url, isAccountReady: isAccountReady } });
        yield session.commitTransaction();
        yield session.endSession();
    }
    catch (error) {
        session.abortTransaction();
        yield session.endSession();
        console.log(error);
        return;
    }
});
exports.handleStripeConnectedAccount = handleStripeConnectedAccount;
