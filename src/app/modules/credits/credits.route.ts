import express from 'express';
import { CreditsController } from './credits.controller';
const router = express.Router();

router
  .route('/')
  .get(CreditsController.getCredits)


export const CreditsRoutes = router;