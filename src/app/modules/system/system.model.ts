
import { model, Schema } from 'mongoose';
import { ISystem, ISystemModel } from './system.interface';

const systemSchema = new Schema<ISystem, ISystemModel>(
  {

    oneRsdToCredits: {
      type: Number,
      default: 0,
    }
    , penaltyTime: {
      type: Number,
      default: 0,
    },
    weatherFee: {
      amount: {
        type: Number,
        default: 0,
      },
      isOn: {
        type: Boolean,
        default: false,
      }
    },
    convenienceFee: {
      amount: {
        type: Number,
        default: 0,
      },
      isOn: {
        type: Boolean,
        default: false,
      }
    },
    arrivalFee: {
      amount: {
        type: Number,
        default: 0,
      },
      isOn: {
        type: Boolean,
        default: false,
      }
    },
  },
  { timestamps: true }
);


export const SystemModel = model<ISystem, ISystemModel>('System', systemSchema);
