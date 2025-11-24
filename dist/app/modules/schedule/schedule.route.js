"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const schedule_controller_1 = require("./schedule.controller");
const router = express_1.default.Router();
router
    .route('/')
    .get((0, auth_1.default)(user_1.USER_ROLES.PROVIDER, user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), schedule_controller_1.ScheduleController.getSchedules)
    .post((0, auth_1.default)(user_1.USER_ROLES.PROVIDER), schedule_controller_1.ScheduleController.createSchedule);
router
    .route('/provider-schedule/:id')
    .get(
// auth(USER_ROLES.USER),
schedule_controller_1.ScheduleController.getProviderSchedules)
    .patch((0, auth_1.default)(user_1.USER_ROLES.PROVIDER), schedule_controller_1.ScheduleController.openCloseSchedule);
router
    .route('/provider-schedule-date/:id')
    .get(schedule_controller_1.ScheduleController.getSchedulesDate);
router
    .route('/:id')
    .get((0, auth_1.default)(user_1.USER_ROLES.PROVIDER, user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), schedule_controller_1.ScheduleController.getSchedule)
    .patch((0, auth_1.default)(user_1.USER_ROLES.PROVIDER), schedule_controller_1.ScheduleController.openCloseSchedule);
exports.ScheduleRoutes = router;
