import { Document } from 'mongoose';

// Define the interface for your settings
export interface ISettings extends Document {
  privacyPolicy: string;
  aboutUs: string;
  termsOfService: string;
}
