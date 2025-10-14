import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
// import validateRequest from '../../middlewares/validateRequest';
import { ProviderController } from './provider.controller';
import { ProviderValidation } from './provider.validation';
import { getMultipleFilesPath } from '../../../shared/getFilePath';
const router = express.Router();

router
  .route('/')
  .get(ProviderController.getProviders)
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
          services: JSON.parse(req.body.services),
          serviceImages: filePaths,
        });

        req.body = validatedData;

        return ProviderController.createProvider(req, res, next);
      } catch (error) {
        next(error); // let error handler send response
      }
    }
  )
  .put(
    auth(USER_ROLES.PROVIDER),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      try {
        // Parse JSON string from multipart
        const filePaths = getMultipleFilesPath(req.files, 'serviceImages');

        // Validate with Zod
        const validatedData = ProviderValidation.updateProviderZodSchema.parse({
          data: req.body.data && JSON.parse(req.body.data),
          services: req.body.services && JSON.parse(req.body.services),
          serviceImages: filePaths && filePaths,
          previousServiceImages: req.body.previousServiceImages && JSON.parse(req.body.previousServiceImages),
        });

        console.log("validatedData", validatedData);

        req.body = validatedData;

        return ProviderController.updateProvider(req, res, next);
      } catch (error) {
        next(error);
      }
    }
  )



router
  .route('/approve-edit-provider/:id')
  .put(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ProviderController.approveEditProvider
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ProviderController.deleteEditProvider
  );

router
  .route('/active-block-provider/:id')
  .put(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ProviderController.activeBlockProvider
  )

router
  .route('/my-provider')
  .get(
    auth(USER_ROLES.PROVIDER),
    ProviderController.getMyProvider
  );

router
  .route('/user-provider/:id')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    ProviderController.getUserProvider
  );

router
  .route('/:id')
  .get(ProviderController.getProvider)
  .put(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ProviderController.approveEditProvider
  )
  .delete(
    auth(USER_ROLES.PROVIDER, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ProviderController.deleteProvider
  );





export const ProviderRoutes = router;
