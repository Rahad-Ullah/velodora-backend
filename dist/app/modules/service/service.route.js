"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRoutes = void 0;
const express_1 = __importDefault(require("express"));
const service_controller_1 = require("./service.controller");
const router = express_1.default.Router();
router
    .route('/')
    .get(service_controller_1.ServiceController.getServices)
    .post(service_controller_1.ServiceController.createService);
router
    .route('/:id')
    .get(service_controller_1.ServiceController.getService)
    .delete(service_controller_1.ServiceController.deleteService)
    .patch(service_controller_1.ServiceController.updateService);
exports.ServiceRoutes = router;
