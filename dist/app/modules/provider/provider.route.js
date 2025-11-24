"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
// import validateRequest from '../../middlewares/validateRequest';
const provider_controller_1 = require("./provider.controller");
const provider_validation_1 = require("./provider.validation");
const getFilePath_1 = require("../../../shared/getFilePath");
const router = express_1.default.Router();
router
    .route('/')
    .get(provider_controller_1.ProviderController.getProviders)
    .post((0, auth_1.default)(user_1.USER_ROLES.PROVIDER), (0, fileUploadHandler_1.default)(), 
// validateRequest(ServiceValidation.createServiceZodSchema),
(req, res, next) => {
    try {
        // Parse JSON string from multipart
        // const {serviceImages, ...parsed} = JSON.parse(req.body.data);
        const filePaths = (0, getFilePath_1.getMultipleFilesPath)(req.files, 'serviceImages');
        // Validate with Zod
        const validatedData = provider_validation_1.ProviderValidation.createProviderZodSchema.parse({
            data: JSON.parse(req.body.data),
            services: JSON.parse(req.body.services),
            serviceImages: filePaths,
        });
        req.body = validatedData;
        return provider_controller_1.ProviderController.createProvider(req, res, next);
    }
    catch (error) {
        next(error); // let error handler send response
    }
})
    .put((0, auth_1.default)(user_1.USER_ROLES.PROVIDER), (0, fileUploadHandler_1.default)(), (req, res, next) => {
    try {
        // Parse JSON string from multipart
        const filePaths = (0, getFilePath_1.getMultipleFilesPath)(req.files, 'serviceImages');
        // Validate with Zod
        const validatedData = provider_validation_1.ProviderValidation.updateProviderZodSchema.parse({
            data: req.body.data && JSON.parse(req.body.data),
            services: req.body.services && JSON.parse(req.body.services),
            serviceImages: filePaths && filePaths,
            previousServiceImages: req.body.previousServiceImages && JSON.parse(req.body.previousServiceImages),
        });
        req.body = validatedData;
        return provider_controller_1.ProviderController.updateProvider(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
router
    .route('/approve-edit-provider/:id')
    .patch((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), provider_controller_1.ProviderController.approveEditProvider)
    .delete((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), provider_controller_1.ProviderController.deleteEditProvider);
router
    .route('/active-block-provider/:id')
    .put((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), provider_controller_1.ProviderController.activeBlockProvider);
router
    .route('/my-provider')
    .get((0, auth_1.default)(user_1.USER_ROLES.PROVIDER), provider_controller_1.ProviderController.getMyProvider);
router
    .route('/user-provider/:id')
    .get((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), provider_controller_1.ProviderController.getUserProvider);
router
    .route('/user-edited-provider/:id')
    .get((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), provider_controller_1.ProviderController.getUserEditedProvider);
router
    .route('/:id')
    .get(provider_controller_1.ProviderController.getProvider)
    .put((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), provider_controller_1.ProviderController.approveProvider)
    .delete((0, auth_1.default)(user_1.USER_ROLES.PROVIDER, user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), provider_controller_1.ProviderController.deleteProvider);
router
    .route('/online-offline-provider')
    .patch((0, auth_1.default)(user_1.USER_ROLES.PROVIDER), provider_controller_1.ProviderController.onlineOflineProvider);
exports.ProviderRoutes = router;
