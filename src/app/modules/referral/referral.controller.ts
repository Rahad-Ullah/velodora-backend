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

const deleteReferralCode = catchAsync(async (req: Request, res: Response) => {


  const result = await ReferralService.deleteReferralFromDB(req.params.referralCodeId as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message
  });
});

const getReferralsList = catchAsync(async (req: Request, res: Response) => {
  const paginationOptions = {
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 10
  };


  const result = await ReferralService.getReferralsListFromDB({
    referralCode: req.query.referralCode as string,
    status: req.query.status as string,
    paginationOptions: paginationOptions,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Referrals data retrieved successfully",
    data: result.data,
    pagination: result.meta
  });
});


export const ReferralController = {
  getReferralCode,
  deleteReferralCode,
  getReferralsList,
};