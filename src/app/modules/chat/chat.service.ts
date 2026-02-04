import { IChat } from './chat.interface';
import { ChatModel } from './chat.model';
import { IMessage } from '../message/message.interface';
import { MessageModel } from '../message/message.model';
import { unlinkFile } from '../../../shared/unlinkFile';
import { MESSAGE_TYPE } from '../message/message.constants';
import { ClientSession } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

// ---------------- create chat service --------------- //
const createChatIntoDB = async (
  userId: string,
  payload: {
    participants: string[];
    session: ClientSession;
  },
): Promise<IChat> => {
  const participants = [...payload.participants];

  if (!participants.includes(userId)) {
    participants.push(userId);
  }

  const isExist = await ChatModel.findOne({
    participants: { $all: participants },
    isDeleted: false,
  }).session(payload.session);

  if (isExist) {
    return isExist;
  }

  // ✅ Use array form for session support
  const [result] = await ChatModel.create(
    [{ participants }],
    { session: payload.session },
  );

  if (!result) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create chat');
  }

  return result;
};

// ---------------- delete chat service ---------------- //
const deleteChatFromDB = async (chatId: string, options: { session: ClientSession }) => {
  const session = options?.session;

  const isExist = await ChatModel.findById(chatId).session(session);
  if (!isExist) {
    throw new Error('ChatModel not found');
  }

  const result = await ChatModel.findByIdAndDelete(chatId).session(session);

  const messages = await MessageModel.find({ chat: chatId }).session(session);
  if (messages.length > 0) {
    await MessageModel.deleteMany({ chat: chatId }).session(session);

    messages.forEach((message: IMessage) => {
      if (message.type === MESSAGE_TYPE.IMAGE && message?.image) {
        unlinkFile(message.image);
      }
    });
  }

  return result;
};

// ---------------- get chats by user id service ---------------- //
const getChatsByIdFromDB = async (
  userId: string,
  query: Record<string, any>
) => {
  
  const chats = await ChatModel.find({ participants: { $in: [userId] } })
    .populate({
      path: 'participants',
      select: 'name email role image',
      match: {
        // isDeleted: false,
        _id: { $ne: userId }, // Exclude userId in the populated participants
        ...(query?.searchTerm && {
          $or: [
            { name: { $regex: query.searchTerm, $options: 'i' } },
          ],
        }),
      }, // Apply $regex only if search is valid },
    })
    .select('participants updatedAt')
    .sort('-updatedAt');


  // Filter out chats where no participants match the search (empty participants)
  const filteredChats = chats?.filter(
    (chat: any) => chat?.participants?.length > 0
  );

  //Use Promise.all to get the last message for each chat
  const chatList: IChat[] = await Promise.all(
    filteredChats?.map(async (chat: any) => {
      const chatData = chat?.toObject();

      const lastMessage: IMessage | null = await MessageModel.findOne({
        chat: chat?._id,
      })
        .sort({ createdAt: -1 })
        .select('text image type sender')
        .populate('sender', 'name role image');

      // find unread messages count
      const unreadCount = await MessageModel.countDocuments({
        chat: chat?._id,
        seenBy: { $nin: [userId] },
      });

      return {
        ...chatData,
        participants: chatData.participants,
        unreadCount: unreadCount || 0,
        lastMessage: lastMessage || null,
      };
    })
  );

  return chatList;
};

export const ChatServices = {
  createChatIntoDB,
  deleteChatFromDB,
  getChatsByIdFromDB,
};
