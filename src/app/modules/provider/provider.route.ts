import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { ProviderController } from './provider.controller';
import { ProviderValidation } from './provider.validation';
import { getMultipleFilesPath } from '../../../shared/getFilePath';
const router = express.Router();

router
  .route('/')
  .get(ProviderController.getProvider)
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
        const validatedData = ProviderValidation.createProviderZodSchema.parse({
          data: JSON.parse(req.body.data),
          serviceImages: filePaths,
        });
        
        req.body = validatedData;

        return ProviderController.createProvider(req, res, next);
      } catch (error) {
        next(error); // let error handler send response
      }
    }
  );


router
  .route('/:id')
  .get(ProviderController.getProvider)
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.PROVIDER),
    ProviderController.deleteProvider
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
        const validatedData = ProviderValidation.updateProviderZodSchema.parse({
          data: JSON.parse(req.body.data),
          serviceImages: filePaths,
        });
        
        req.body = validatedData;

        return ProviderController.updateProvider(req, res, next);
      } catch (error) {
        next(error); // let error handler send response
      }
    }
  );




export const ProviderRoutes = router;
