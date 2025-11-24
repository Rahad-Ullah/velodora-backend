"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavListRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const favList_controller_1 = require("./favList.controller");
const favList_validation_1 = require("./favList.validation");
const router = express_1.default.Router();
router
    .route('/')
    .get((0, auth_1.default)(user_1.USER_ROLES.USER), favList_controller_1.FavListController.getFavList)
    .post((0, auth_1.default)(user_1.USER_ROLES.USER), (0, validateRequest_1.default)(favList_validation_1.FavListValidation.favListZodSchema), favList_controller_1.FavListController.createFavList);
router
    .route('/fav-list-with-details')
    .get((0, auth_1.default)(user_1.USER_ROLES.USER), favList_controller_1.FavListController.getFavListUser);
exports.FavListRoutes = router;
