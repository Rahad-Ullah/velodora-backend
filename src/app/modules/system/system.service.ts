import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { SystemModel } from './system.model';
import { ISystem } from './system.interface';


// create system to db
const createSystemToDB = async (): Promise<any> => {

  const isExistSystem = await SystemModel.findOne({});
  if (isExistSystem) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'System already exists');
  }

  const system = await SystemModel.create({});
  if (!system) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'System not created');
  }

  return { message: 'System created successfully', data: system };
};


// get system to db
const getSystemFromDB = async (): Promise<any> => {

  const isExistSystem = await SystemModel.findOne({});
  if (!isExistSystem) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'System not found');
  }

  return { message: 'System retrieved successfully', data: isExistSystem };
};

// update system to db
const updateSystemToDB = async (payload: any): Promise<any> => {

  const isExistSystem = await SystemModel.findOne({});
  if (!isExistSystem) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'System not found');
  }

  if (payload.oneRsdToCredits) {
    isExistSystem.oneRsdToCredits = payload.oneRsdToCredits;
  }
  if (payload.penaltyTime) {
    isExistSystem.penaltyTime = payload.penaltyTime;
  }
  if (payload.weatherFee) {
    isExistSystem.weatherFee = {
      amount: payload.weatherFee,
      isOn: isExistSystem.weatherFee.isOn,
    };
  }
  if (payload.convenienceFee) {
    isExistSystem.convenienceFee = {
      amount: payload.convenienceFee,
      isOn: isExistSystem.convenienceFee.isOn,
    };
  }
  if (payload.arrivalFee) {
    isExistSystem.arrivalFee = {
      amount: payload.arrivalFee,
      isOn: isExistSystem.arrivalFee.isOn,
    };
  }

  const newSystem = await isExistSystem.save();

  return { message: 'System updated successfully', data: newSystem };
};

// on/off system to db
const onOffSystemToDB = async (payload: string): Promise<any> => {

  const isExistSystem = await SystemModel.findOne({});
  if (!isExistSystem) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'System not found');
  }
  if (payload === "weatherFee") {
    isExistSystem.weatherFee = {
      amount: isExistSystem.weatherFee.amount,
      isOn: !isExistSystem.weatherFee.isOn,
    };
  }
  if (payload === "convenienceFee") {
    isExistSystem.convenienceFee = {
      amount: isExistSystem.convenienceFee.amount,
      isOn: !isExistSystem.convenienceFee.isOn,
    };
  }
  if (payload === "arrivalFee") {
    isExistSystem.arrivalFee = {
      amount: isExistSystem.arrivalFee.amount,
      isOn: !isExistSystem.arrivalFee.isOn,
    };
  }

  const newSystem = await isExistSystem.save();

  return { message: 'System on/off successfully', data: newSystem };
};


export const SystemService = {
  createSystemToDB,
  getSystemFromDB,
  updateSystemToDB,
  onOffSystemToDB
};
