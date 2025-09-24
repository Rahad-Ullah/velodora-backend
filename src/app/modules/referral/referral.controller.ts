import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ReferralService } from './referral.service';


const getReferralCode = catchAsync(async (req: Request, res: Response) => {
  console.log("Referral Controller - user: ", req.user.id);
  const result = await ReferralService.getReferralFromDB(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result.code,
  });
});


export const ReferralController = {
  getReferralCode
};