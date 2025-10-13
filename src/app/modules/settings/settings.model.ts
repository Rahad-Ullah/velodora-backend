import { Schema, model } from 'mongoose';
import { ISettings } from './settings.interface'; // Adjust the path as necessary

const settingsSchema = new Schema<ISettings>(
  {
    privacyPolicy: {
      type: String,
      default: '',
    },
    providerUsagePolicy: {
      type: String,
      default: '',
    },
    termsAndConditions: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);

// Create the model
const Settings = model<ISettings>('Settings', settingsSchema);

export default Settings;
