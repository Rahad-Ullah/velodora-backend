import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { PromoCodeModel } from './promoCode.model';
import { TPromoCode } from './promoCode.interface';

// get promo code from DB
const getPromoCodeFromDB = async (code: string): Promise<any> => {

  const isExistPromoCode = await PromoCodeModel.findOne({
    code: code,
    limits: { $gt: 0 },
    start: { $lt: new Date() },
    end: { $gt: new Date() },
  });

  if (!isExistPromoCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Promo code not found or expired');
  }

  return { code: isExistPromoCode, message: "Promo code found successfully" };
};

// create promo code from DB
const createPromoCodeToDB = async (payload: TPromoCode): Promise<any> => {

  const isExistPromoCode = await PromoCodeModel.findOne({ code: payload.code });

  if (isExistPromoCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Promo code already exist');
  }

  // Save in DB
  const promoCode = await PromoCodeModel.create(payload);

  if (!promoCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create promo code');
  }

  return { code: promoCode, message: "Promo code created successfully" };
};

// create promo code from DB
const getPromoCodesFromDB = async (): Promise<any> => {

  const isExistPromoCodes = await PromoCodeModel.find({});

  if (!isExistPromoCodes) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Promo codes not found');
  }

  return { codes: isExistPromoCodes, message: "Promo codes found successfully" };
};

export const PromoCodeService = {
  createPromoCodeToDB,
  getPromoCodesFromDB,
  getPromoCodeFromDB,
};
