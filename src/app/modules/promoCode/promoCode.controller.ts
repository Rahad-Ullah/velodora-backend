import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PromoCodeService } from './promoCode.service';


const createPromoCode = catchAsync(async (req: Request, res: Response) => {

  const result = await PromoCodeService.createPromoCodeToDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result.code,
  });
});

const getPromoCode = catchAsync(async (req: Request, res: Response) => {

  const result = await PromoCodeService.getPromoCodeFromDB(req.params.code as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result.code,
  });
});

const getPromoCodes = catchAsync(async (req: Request, res: Response) => {

  const result = await PromoCodeService.getPromoCodesFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result.codes,
  });
});


export const PromoCodeController = {
  createPromoCode,
  getPromoCodes,
  getPromoCode,
};