import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PromoCodeService } from './promoCode.service';

// create promo code controller
const createPromoCode = catchAsync(async (req: Request, res: Response) => {

  const result = await PromoCodeService.createPromoCodeToDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result.code,
  });
});

// delete promo code controller
const deletePromoCode = catchAsync(async (req: Request, res: Response) => {

  const result = await PromoCodeService.deletePromoCodeFromDB(req.params.code as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result.code,
  });
});

// get promo code controller
const getPromoCode = catchAsync(async (req: Request, res: Response) => {

  const result = await PromoCodeService.getPromoCodeFromDB(req.params.code as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result.code,
  });
});

// get promo codes controller
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
  deletePromoCode,
};