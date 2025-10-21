import express from 'express';
import { RevenueController } from './revenue.controller';
const router = express.Router();

router
  .route('/')
  .get(RevenueController.getRevenues)

router
  .route('/general-state')
  .get(RevenueController.generalState)


export const RevenueRoutes = router;