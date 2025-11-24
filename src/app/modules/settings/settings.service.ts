import Settings from './settings.model';
import { ISettings } from './settings.interface.js';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import colors from 'colors';
import { UserModel } from '../user/user.model';
import { emailQueue } from '../../queues/email.queue';
import { USER_ROLES } from '../../../enums/user';

const addSettings = async () => {

  const data = {
    privacyPolicy: '',
    providerUsagePolicy: '',
    termsAndConditions: '',
  };

  const existingSettings = await Settings.findOne({});
  if (existingSettings) {
    return;
  } else {
    const result = await Settings.create(data);

    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to add Settings');
    } else {
      console.log(colors.green('✅ Default settings added to the database'));
    }
  }
};

const getSettings = async (
  title?: string,
): Promise<Partial<ISettings>> => {
  const settings = await Settings.findOne().select(title ? title : '');

  return settings!;
};

// Function to update settings
const updateSettings = async (
  settingsBody: Partial<ISettings>
): Promise<string> => {
  // Update the settings (no ID needed)
  await Settings.findOneAndUpdate({}, settingsBody);
  console.log("settings:", settingsBody)

  // Fetch users
  let users;
  if (settingsBody.termsAndConditions) {
    users = await UserModel.find({ isDeleted: false });
  } else if (settingsBody.providerUsagePolicy) {
    users = await UserModel.find({ role: USER_ROLES.PROVIDER, isDeleted: false });
  } else if (settingsBody.privacyPolicy) {
    users = await UserModel.find({ isDeleted: false, role: USER_ROLES.USER });
  } else {
    users = await UserModel.find({ isDeleted: false });
  }

  // Queue email for every user (with proper async handling)
  for (const user of users) {
    const data = {
      to: user.email,
      subject: 'Settings Updated',
      html: 'Settings updated successfully',
    };

    await emailQueue.add('send-email', data, {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  return `${Object.keys(settingsBody).join(', ')} updated successfully`;
};


export const settingsService = {
  addSettings,
  updateSettings,
  getSettings,
};




