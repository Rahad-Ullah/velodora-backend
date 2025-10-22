import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { FavListController } from './favList.controller';
import { FavListValidation } from './favList.validation';
const router = express.Router();

router
  .route('/')
  .get(
    auth(USER_ROLES.USER),
    FavListController.getFavList
  )
  .post(
    auth(USER_ROLES.USER),
    validateRequest(FavListValidation.favListZodSchema),
    FavListController.createFavList
  );

router
  .route('/fav-list-with-details')
  .get(
    auth(USER_ROLES.USER),
    FavListController.getFavListUser
  )


export const FavListRoutes = router;