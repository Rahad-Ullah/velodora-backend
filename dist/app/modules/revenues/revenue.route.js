"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueRoutes = void 0;
const express_1 = __importDefault(require("express"));
const revenue_controller_1 = require("./revenue.controller");
const router = express_1.default.Router();
router
    .route('/')
    .get(revenue_controller_1.RevenueController.getRevenues);
router
    .route('/general-state')
    .get(revenue_controller_1.RevenueController.generalState);
exports.RevenueRoutes = router;
