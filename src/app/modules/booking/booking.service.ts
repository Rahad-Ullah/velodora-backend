import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { BookingModel } from './booking.model';
import { generateSlots } from '../../../util/generateSlots';
import mongoose, { Types } from 'mongoose';
import { ProviderModel } from '../provider/provider.model';


//create schedule to db
const createBookingToDB = async (): Promise<any> => {
  

  let schedule: any;

  return schedule;
};

export const BookingService = {
  createBookingToDB,
};