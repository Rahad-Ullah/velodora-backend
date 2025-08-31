import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryController } from './category.controller';
import { CategoryValidation } from './category.validation';
const router = express.Router();

router
  .route('/')
  .get(CategoryController.getCategories)
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = CategoryValidation.updateCategoryZodSchema.parse(
          JSON.parse(req.body.data)
        );
      }
      return CategoryController.createCategory(req, res, next);
    }
  );

router
  .route('/:id')
  .get(CategoryController.getCategory)
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    CategoryController.deleteCategory
  )
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = CategoryValidation.updateCategoryZodSchema.parse(
          JSON.parse(req.body.data)
        );
      }
      return CategoryController.updateCategory(req, res, next);
    }
  );




export const CategoryRoutes = router;
