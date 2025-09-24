import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { SubCategoryController } from './subCategory.controller';
import { SubCategoryValidation } from './subCategory.validation';
const router = express.Router();

router
  .route('/')
  .get(SubCategoryController.getSubCategories)
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(SubCategoryValidation.createSubCategoryZodSchema),
    SubCategoryController.createSubCategory
  );

router
  .route('/:id')
  .get(SubCategoryController.getSubCategory)
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    SubCategoryController.deleteSubCategory
  )
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(SubCategoryValidation.updateSubCategoryZodSchema),
    SubCategoryController.updateSubCategory
  );




export const SubCategoryRoutes = router;
