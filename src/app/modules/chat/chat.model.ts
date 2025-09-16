import { Schema, model } from 'mongoose';
import { IChat, TChatModel } from './chat.interface';

const chatSchema = new Schema<IChat, TChatModel>(
  {
    participants: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const ChatModel = model<IChat, TChatModel>('Chat', chatSchema);
