"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const credits_controller_1 = require("./credits.controller");
const router = express_1.default.Router();
router
    .route('/')
    .get(credits_controller_1.CreditsController.getCredits);
exports.CreditsRoutes = router;
