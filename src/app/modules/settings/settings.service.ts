import mongoose from 'mongoose';
import Settings from './settings.model';
import { ISettings } from './settings.interface.js';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const addSettings = async (data: Partial<ISettings>): Promise<ISettings> => {
  const existingSettings = await Settings.findOne({});
  if (existingSettings) {
    return existingSettings;
  } else {
    const result = await Settings.create(data);

    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to add music');
    }
    return result;
  }
};

const getSettings = async (
  title?: string,
): Promise<any> => {
  console.log(title);
  const settings = await Settings.findOne().select(title ? title : '');
  console.log(settings)

  return settings;
};

// Function to update settings without needing an ID
const updateSettings = async (
  settingsBody: Partial<ISettings>,
): Promise<ISettings | null> => {
  console.log('settingsBody,', settingsBody);
  const settings = await Settings.findOneAndUpdate({}, settingsBody, {
    new: true,
  });

  return settings;
};

export const settingsService = {
  addSettings,
  updateSettings,
  getSettings,
};




