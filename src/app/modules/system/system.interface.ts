import { Model } from 'mongoose';

export type ISystem = {
  oneRsdToCredits: number;
  penaltyTime: number;
  weatherFee: {
    amount: number;
    isOn: boolean;
  };
  convenienceFee: {
    amount: number;
    isOn: boolean;
  };
  arrivalFee: {
    amount: number;
    isOn: boolean;
  };
};

export type ISystemModel = Model<ISystem>;
