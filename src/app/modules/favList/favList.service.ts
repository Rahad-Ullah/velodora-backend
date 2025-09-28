import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { FavListModel } from './favList.model';


// add or remove provider to my fav list
const createFavListToDB = async (userId: string, providerId: string): Promise<any> => {
  let res = null;

  const isExistFavList = await FavListModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });

  if (isExistFavList) {
    if (isExistFavList.providerIds.includes(new mongoose.Types.ObjectId(providerId))) {
      res = await FavListModel.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        { $pull: { providerIds: new mongoose.Types.ObjectId(providerId) } },
        { new: true } // ✅ works here
      );
    } else {
      res = await FavListModel.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        { $push: { providerIds: new mongoose.Types.ObjectId(providerId) } },
        { new: true } // ✅ works here
      );
    }
  } else {
    const payload = {
      userId: new mongoose.Types.ObjectId(userId),
      providerIds: [new mongoose.Types.ObjectId(providerId)],
    };
    res = await FavListModel.create(payload);
  }



  return res;
};
// get my fav lists
const getFavListToDB = async (userId: string): Promise<any> => {

  const isExistFavList = await FavListModel.findOne({ userId: new mongoose.Types.ObjectId(userId) }).populate('providerIds', 'aboutMe primaryLocation serviceDistance pricePerHour serviceImages isOnline');

  if (!isExistFavList) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "FavList doesn't exist!");
  }


  return isExistFavList;
};

export const FavListService = {
  createFavListToDB,
  getFavListToDB
};
