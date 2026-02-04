import Settings from './settings.model';
import { ISettings } from './settings.interface.js';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import colors from 'colors';
import { UserModel } from '../user/user.model';
import { USER_ROLES } from '../../../enums/user';
import { emailQueueHelper } from '../../../helpers/emailQueueHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
// import { sendNotifications } from '../../../helpers/notificationHelper';
// import { NOTIFICATION_TYPE } from '../notification/notification.constants';

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
  let message = '';
  if (settingsBody.termsAndConditions) {
    users = await UserModel.find({ isDeleted: false });
    message = 'Terms and conditions';
  } else if (settingsBody.providerUsagePolicy) {
    users = await UserModel.find({ role: USER_ROLES.PROVIDER, isDeleted: false });
    message = 'Provider usage policy';
  } else if (settingsBody.privacyPolicy) {
    users = await UserModel.find({ isDeleted: false, role: USER_ROLES.USER });
    message = 'Privacy policy';
  } else {
    users = await UserModel.find({ isDeleted: false });
  }

  // Queue email for every user (with proper async handling)
  for (const user of users) {
    const data = emailTemplate?.settingsEmailTemplate({ email: user.email!, name: user?.name!, message });
    await emailQueueHelper(data);

    // sendNotifications({
    //   type: NOTIFICATION_TYPE.SETTINGS,
    //   title: `${message} Updated. Please review the latest changes.`,
    //   receiver: user?._id!,
    //   referenceId: user?._id,
    // });
  }

  return `${Object.keys(settingsBody).join(', ')} updated successfully`;
};


export const settingsService = {
  addSettings,
  updateSettings,
  getSettings,
};




