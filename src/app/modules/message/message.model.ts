import { Schema, model } from 'mongoose';
import { IMessage, TMessageModel } from './message.interface';
import { MESSAGE_TYPE } from './message.constants';

const messageSchema = new Schema<IMessage, TMessageModel>(
  {
    chat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(MESSAGE_TYPE),
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    seenBy: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const MessageModel = model<IMessage, TMessageModel>('Message', messageSchema);
