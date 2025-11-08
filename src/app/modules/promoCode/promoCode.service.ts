import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { PromoCodeModel } from './promoCode.model';
import { TPromoCode } from './promoCode.interface';

// delete promo code from DB
const deletePromoCodeFromDB = async (id: string): Promise<any> => {

  const isExistPromoCode = await PromoCodeModel.findByIdAndDelete(id)

  if (!isExistPromoCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Promo code not found');
  }

  return { code: isExistPromoCode, message: "Promo code deleted successfully" };
};

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

// create promo code to DB
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

// get promo codes from DB
const getPromoCodesFromDB = async (): Promise<any> => {

  const isExistPromoCodes = await PromoCodeModel.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "bookings",
        let: { promo_code: "$code" },
        pipeline: [
          { $match: { $expr: { $eq: ["$promoCode", "$$promo_code"] } } },
          { $count: "count" }
        ],
        as: "bookings"
      }
    },
    {
      $addFields: {
        totalUsed: {
          $ifNull: [{ $arrayElemAt: ["$bookings.count", 0] }, 0]
        }
      }
    },
    {
      $project: {
        bookings: 0 // optional — removes the raw bookings array
      }
    }
  ]);

  if (!isExistPromoCodes) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Promo codes not found');
  }

  return { codes: isExistPromoCodes, message: "Promo codes found successfully" };
};

export const PromoCodeService = {
  createPromoCodeToDB,
  getPromoCodesFromDB,
  getPromoCodeFromDB,
  deletePromoCodeFromDB,
};
