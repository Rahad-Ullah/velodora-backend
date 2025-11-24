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
exports.settingsService = void 0;
const settings_model_1 = __importDefault(require("./settings.model"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const colors_1 = __importDefault(require("colors"));
const addSettings = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = {
        privacyPolicy: '',
        providerUsagePolicy: '',
        termsAndConditions: '',
    };
    const existingSettings = yield settings_model_1.default.findOne({});
    if (existingSettings) {
        return;
    }
    else {
        const result = yield settings_model_1.default.create(data);
        if (!result) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to add Settings');
        }
        else {
            console.log(colors_1.default.green('✅ Default settings added to the database'));
        }
    }
});
const getSettings = (title) => __awaiter(void 0, void 0, void 0, function* () {
    const settings = yield settings_model_1.default.findOne().select(title ? title : '');
    return settings;
});
// Function to update settings without needing an ID
const updateSettings = (settingsBody) => __awaiter(void 0, void 0, void 0, function* () {
    yield settings_model_1.default.findOneAndUpdate({}, settingsBody);
    return `${Object.keys(settingsBody).join(', ').toString()} updated successfully`;
});
exports.settingsService = {
    addSettings,
    updateSettings,
    getSettings,
};
