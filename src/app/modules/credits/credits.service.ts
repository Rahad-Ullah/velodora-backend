import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICredits } from './credits.interface';
import { CreditsModel } from './credits.model';


//create sub category
const createCreditToDB = async (payload: Partial<ICredits>): Promise<any> => {

  const res = await CreditsModel.create(payload);
  if (!res) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create credits!");
  }

  return { data: res };
};

//get sub categories
const getCreditsFromDB = async (): Promise<any> => {

  const data = await CreditsModel.find({});

  return { data };
};

export const CreditsService = {
  createCreditToDB,
  getCreditsFromDB
};
