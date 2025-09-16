import { JwtPayload } from 'jsonwebtoken';
import { IChat } from './chat.interface';
import { ChatModel } from './chat.model';
import { IMessage } from '../message/message.interface';
import { MessageModel } from '../message/message.model';

// ---------------- create chat service ---------------
const createChatIntoDB = async (
  userId: string,
  payload: any
): Promise<IChat> => {
  const participants = [...payload.participants];
  // push the user id to participants if not already included
  if (!participants.includes(userId)) {
    participants.push(userId);
  }

  // create chat if it does not exist
  const isExist = await ChatModel.findOne({
    participants: { $all: participants },
    isDeleted: false,
  });
  if (isExist) {
    return isExist;
  }

  const result = await ChatModel.create({ participants });
  return result;
};

// ---------------- delete chat service ----------------
const deleteChatFromDB = async (chatId: string) => {
  const isExist = await ChatModel.findById(chatId);
  if (!isExist) {
    throw new Error('ChatModel not found');
  }

  const result = await ChatModel.findByIdAndUpdate(
    chatId,
    { isDeleted: true },
    { new: true }
  );
  return result;
};

// ---------------- get chats by user id service ----------------
const getChatsByIdFromDB = async (
  userId: string,
  query: Record<string, any>
) => {
  const chats = await ChatModel.find({ participants: { $in: [userId] } })
    .populate({
      path: 'participants',
      select: 'firstName lastName email image isOnline',
      match: {
        isDeleted: false,
        _id: { $ne: userId }, // Exclude userId in the populated participants
        ...(query?.searchTerm && {
          $or: [
            { firstName: { $regex: query.searchTerm, $options: 'i' } },
            { lastName: { $regex: query.searchTerm, $options: 'i' } },
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
        .populate('sender', 'firstName lastName image');

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
