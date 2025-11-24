"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const router = express_1.default.Router();
router
    .route('/user')
    .post(user_controller_1.UserController.createUser);
router
    .route('/profile')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.USER, user_1.USER_ROLES.PROVIDER), user_controller_1.UserController.getUserProfile)
    .delete((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.USER, user_1.USER_ROLES.PROVIDER), user_controller_1.UserController.deleteProfile)
    .patch((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.USER, user_1.USER_ROLES.PROVIDER), (0, fileUploadHandler_1.default)(), (req, res, next) => {
    if (req.body.data) {
        req.body = user_validation_1.UserValidation.updateUserZodSchema.parse(JSON.parse(req.body.data));
    }
    return user_controller_1.UserController.updateProfile(req, res, next);
});
router
    .route('/update-profile-image')
    .patch((0, auth_1.default)(user_1.USER_ROLES.PROVIDER), (0, fileUploadHandler_1.default)(), (req, res, next) => {
    if (req.body.data) {
        req.body = user_validation_1.UserValidation.updateUserZodSchema.parse(JSON.parse(req.body.data));
    }
    return user_controller_1.UserController.updateProfileImage(req, res, next);
});
router
    .route('/users')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), user_controller_1.UserController.getUsers);
// .post(
//   auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
//   UserController.createUsers
// )
router
    .route('/total-users-providers')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), user_controller_1.UserController.totalUsersProvider);
router
    .route('/withdraw-to-provider')
    .post((0, auth_1.default)(user_1.USER_ROLES.PROVIDER), user_controller_1.UserController.withdraw);
router
    .route('/sub-admin')
    .post((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), user_controller_1.UserController.createSubAdmin)
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), user_controller_1.UserController.getSubAdmins);
router
    .route('/sub-admin/:id')
    .delete((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), user_controller_1.UserController.deleteSubAdmin);
router
    .route('/users/edit-profile/:id')
    .patch((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), user_controller_1.UserController.approveUpdateProfile)
    .delete((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), user_controller_1.UserController.deleteUpdateProfile);
router
    .route('/users/change-status/:id')
    .patch((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), user_controller_1.UserController.updateUserStatus);
router
    .route('/users/:id')
    .delete((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), user_controller_1.UserController.deleteUser)
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), user_controller_1.UserController.getUser);
router
    .route('/edited-users/:id')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), user_controller_1.UserController.getEditedUser);
router
    .route('/active-block-users/:id')
    .delete((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), user_controller_1.UserController.activeBlockUser);
router
    .route('/give-credits/:id')
    .patch((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), user_controller_1.UserController.giveCredits);
router
    .route('/get-rsd')
    .get((0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.PROVIDER), user_controller_1.UserController.getRsd);
// router
//   .route('/users-aggregation')
//   .get(
//     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
//     UserController.getUsersAggregation
//   );
exports.UserRoutes = router;
