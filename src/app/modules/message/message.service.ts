import { JwtPayload } from 'jsonwebtoken';
import { ChatModel } from '../chat/chat.model';
import { IMessage } from './message.interface';
import { MessageModel } from './message.model';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { MESSAGE_TYPE } from './message.constants';
import { NOTIFICATION_TYPE } from '../notification/notification.constants';
import { Types } from 'mongoose';
import { sendNotifications } from '../../../helpers/notificationHelper';

// ----------------- create message service ---------------
const createMessage = async (payload: IMessage): Promise<IMessage> => {
  // check if the chat exists and the sender is a participant
  const isChatExist = await ChatModel.findOne({
    _id: payload.chat,
    isDeleted: false,
    participants: { $in: [payload.sender] },
  });
  if (!isChatExist) throw new Error('ChatModel not found or deleted');

  const result = await MessageModel.create(payload);
  if (!result) {
    throw new ApiError(400, 'Failed to create message');
  };

  const msgResponse = await MessageModel.findById(result._id).populate('sender', { role: 1, name: 1, image: 1 });
  if (!msgResponse) throw new ApiError(400, 'Failed to get message');

  // emit socket event for new message
  const io = global.io;
  if (io) {
    io.emit(`getMessage::${payload.chat}`, msgResponse);
  }

  // Find the receiver(s): all participants except the sender
  const receivers = isChatExist.participants.filter(
    (participantId: Types.ObjectId) =>
      participantId.toString() !== payload.sender.toString()
  );

  // notify the receiver(s) for attachment //
  if (payload.type === MESSAGE_TYPE.IMAGE || payload.type === MESSAGE_TYPE.TEXT) {
    await Promise.all(
      receivers.map((receiverId: Types.ObjectId) =>
        sendNotifications({
          type: NOTIFICATION_TYPE.MESSAGE,
          title: 'You have received an new message',
          receiver: receiverId,
          referenceId: result._id,
        })
      )
    );
  }

  // update the chat to sort it to the top
  await ChatModel.findByIdAndUpdate(payload.chat, {});

  return result;
};

// ----------------- get messages by chat id -------------------
export const getChatMessages = async (
  chatId: string,
  query: Record<string, any>,
  user: JwtPayload
) => {
  // check if the chat exists
  const existingChat = await ChatModel.findById(chatId);
  if (!existingChat) throw new ApiError(401, 'Chat not found');

  // get another participant
  const anotherParticipant = existingChat.participants.filter(
    participant => participant.toString() !== user?.id
  )[0];

  // update seen status those are seen by the user right now
  await MessageModel.updateMany(
    { chat: chatId, seenBy: { $nin: [user?.id] } },
    { $addToSet: { seenBy: user?.id } }
  );

  const messageQuery = new QueryBuilder(MessageModel.find({ chat: chatId }), query)
    .populate(['sender'], { sender: { role: 1, name: 1, email: 1 } })
    .sort(['-createdAt'])
    .paginate()
    .search(['text'])
    .filter();

  const [messages, pagination] = await Promise.all([
    messageQuery.modelQuery.lean(),
    messageQuery.getPaginationInfo(),
  ]);

  // add seen status to messages
  const messagesWithStatus = messages.map((message: any) => {
    return {
      ...message,
      isSeen: message.seenBy
        .map((id: string) => id.toString())
        .includes(anotherParticipant.toString()),
    };
  });

  return { messages: messagesWithStatus, pagination };
};
// ----------------- get messages by chat id -------------------
export const getUnreadMessagesAmount = async (
  user: JwtPayload
): Promise<any> => {
  console.log(user);
  const userId = new Types.ObjectId(user?.id as string);

  const chats = await ChatModel.aggregate([
    {
      $match: {
        isDeleted: false,
        participants: { $in: [userId] }
      }
    },
    {
      $project: {
        _id: 1
      }
    }
  ]);

  const chatList = chats.map((chat: any) => chat._id);


  const unreadMessageCount = await MessageModel.aggregate([
    {
      $match: {
        chat: { $in: chats.map((chat: any) => chat._id) },
        sender: { $ne: userId },
        seenBy: { $nin: [userId] },
      },
    },
    {
      $group: {
        _id: "$chat", // Group by the chat ID
      },
    },
    {
      $count: "distinctChats" // Count the number of distinct chats
    }
  ]);

  console.log(unreadMessageCount[0]?.distinctChats);


  // return { data: { chats: chatList, unreadMessage: unreadMessageCount[0]?.distinctChats || 0 } };
  return { data: unreadMessageCount[0]?.distinctChats || 0 };
};

export const MessageServices = { createMessage, getChatMessages, getUnreadMessagesAmount };
