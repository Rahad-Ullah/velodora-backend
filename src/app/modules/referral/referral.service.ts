import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { generateUniqueReferralCode } from '../../../util/generateRefferalCode';
import { ReferralModel } from './referral.model';

//login
const getReferralFromDB = async ( adminId:string ) => {
  // Generate unique code
  const code = await generateUniqueReferralCode();

  const newReferral = { code, createdBy: adminId }

  // Save in DB
  const referral = await ReferralModel.create(newReferral);

  if (!referral) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create referral');
  }

  return { code, message: "Referral code created successfully" };
};


export const ReferralService = {
  getReferralFromDB,
};
