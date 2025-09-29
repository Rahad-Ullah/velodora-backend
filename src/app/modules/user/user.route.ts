import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
const router = express.Router();

router
  .route('/user')
  .post( UserController.createUser );

router
  .route('/profile')
  .get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.PROVIDER), UserController.getUserProfile)
  .delete(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.PROVIDER), UserController.deleteProfile)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.PROVIDER),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = UserValidation.updateUserZodSchema.parse(
          JSON.parse(req.body.data)
        );
      }
      return UserController.updateProfile(req, res, next);
    }
  );


router
  .route('/users')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    UserController.createUsers
  )
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    UserController.getUsers
  );

  
router
  .route('/users/edit-profile/:id')
  .patch(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), UserController.approveUpdateProfile)
  .delete(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), UserController.deleteUpdateProfile);


router
  .route('/users/change-status/:id')
  .patch(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), UserController.updateUserStatus);
    

router
  .route('/users/:id')
  .delete(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), UserController.deleteUser)
  .get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), UserController.getUser)

router
  .route('/active-block-users/:id')
  .delete(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), UserController.activeBlockUser)
  
// router
//   .route('/users-aggregation')
//   .get(
//     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
//     UserController.getUsersAggregation
//   );





export const UserRoutes = router;
