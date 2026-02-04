import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
const router = express.Router();

router
  .route('/user')
  .post(UserController.createUser);

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
  .route('/update-profile-image')
  .patch(
    auth(USER_ROLES.PROVIDER),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = UserValidation.updateUserZodSchema.parse(
          JSON.parse(req.body.data)
        );
      }
      return UserController.updateProfileImage(req, res, next);
    }
  );


router
  .route('/users')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    UserController.getUsers
  )
// .post(
//   auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
//   UserController.createUsers
// )

router
  .route('/download-users')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    UserController.downloadUsers
  )

router
  .route('/total-users-providers')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    UserController.totalUsersProvider
  );

router
  .route('/withdraw-to-provider')
  .post(
    auth(USER_ROLES.PROVIDER),
    UserController.withdraw
  );

router
  .route('/sub-admin')
  .post(
    auth(USER_ROLES.SUPER_ADMIN),
    UserController.createSubAdmin
  )
  .get(
    auth(USER_ROLES.SUPER_ADMIN),
    UserController.getSubAdmins
  );

router
  .route('/sub-admin/:id')
  .delete(
    auth(USER_ROLES.SUPER_ADMIN),
    UserController.deleteSubAdmin
  )

router
  .route('/delete-user-by-admin/:id')
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    UserController.deleteUserByAdmin
  )


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
  .route('/edited-users/:id')
  .get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), UserController.getEditedUser)

router
  .route('/active-block-users/:id')
  .delete(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), UserController.activeBlockUser)

router
  .route('/give-credits/:id')
  .patch(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), UserController.giveCredits)

router
  .route('/get-rsd')
  .get(auth(USER_ROLES.USER, USER_ROLES.PROVIDER), UserController.getRsd)

// router
//   .route('/users-aggregation')
//   .get(
//     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
//     UserController.getUsersAggregation
//   );





export const UserRoutes = router;
