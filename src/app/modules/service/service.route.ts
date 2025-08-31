import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { ServiceController } from './service.controller';
import { ServiceValidation } from './service.validation';
import { getMultipleFilesPath } from '../../../shared/getFilePath';
const router = express.Router();

router
  .route('/')
  .get(ServiceController.getServices)
  .post(
    auth(USER_ROLES.PROVIDER),
    fileUploadHandler(),
    // validateRequest(ServiceValidation.createServiceZodSchema),
    (req: Request, res: Response, next: NextFunction) => {
      try {
        // Parse JSON string from multipart
        // const {serviceImages, ...parsed} = JSON.parse(req.body.data);
        // console.log("req.body.data", req.body.data);
        const filePaths = getMultipleFilesPath(req.files, 'serviceImages');

        // Validate with Zod
        const validatedData = ServiceValidation.createServiceZodSchema.parse({
          data: JSON.parse(req.body.data),
          serviceImages: filePaths,
        });
        
        req.body = validatedData;

        return ServiceController.createService(req, res, next);
      } catch (error) {
        next(error); // let error handler send response
      }
    }
  );


router
  .route('/:id')
  .get(ServiceController.getService)
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.PROVIDER),
    ServiceController.deleteService
  )
  .patch(
    auth(USER_ROLES.PROVIDER),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      try {
        // Parse JSON string from multipart
        // const {serviceImages, ...parsed} = JSON.parse(req.body.data);
        // console.log("req.body.data", req.body.data);
        const filePaths = getMultipleFilesPath(req.files, 'serviceImages');

        // Validate with Zod
        const validatedData = ServiceValidation.updateUserZodSchema.parse({
          data: JSON.parse(req.body.data),
          serviceImages: filePaths,
        });
        
        req.body = validatedData;

        return ServiceController.updateService(req, res, next);
      } catch (error) {
        next(error); // let error handler send response
      }
    }
  );




export const ServiceRoutes = router;
