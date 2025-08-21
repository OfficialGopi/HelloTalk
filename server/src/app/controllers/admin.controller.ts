import { env } from "../../env";
import { cookieOptions, tokenFieldNames } from "../constants/cookie.constant";
import { ChatModel } from "../models/chat.model";
import { MessageModel } from "../models/message.model";
import { UserModel } from "../models/user.model";
import { AsyncHandler } from "../utils/async-handler.util";
import { ApiError, ApiResponse } from "../utils/response-formatter.util";
import jwt from "jsonwebtoken";

const adminLogin = AsyncHandler(async (req, res, next) => {
  const { secretKey } = req.body;

  const isMatched = secretKey === env.ADMIN_SECRET_KEY;

  if (!isMatched) throw new ApiError(401, "Invalid Admin Key");

  const token = jwt.sign(
    {
      adminSecretKey: env.ADMIN_SECRET_KEY,
    },
    env.ADMIN_TOKEN_SECRET,
    {
      expiresIn: env.ADMIN_TOKEN_EXPIRY,
    } as jwt.SignOptions,
  );

  return res
    .status(200)
    .cookie(tokenFieldNames.adminToken, token, cookieOptions)
    .json(new ApiResponse(200, {}, "Success"));
});
const adminLogout = AsyncHandler(async (req, res, next) => {
  return res
    .status(200)
    .clearCookie(tokenFieldNames.adminToken)
    .json(new ApiResponse(200, {}, "Success"));
});
const getAdminData = AsyncHandler(async (req, res, next) => {
  return res.status(200).json(new ApiResponse(200, true, "Success"));
});
const allUsers = AsyncHandler(async (req, res, next) => {
  const users = await UserModel.find({});

  const transformedUsers = await Promise.all(
    users.map(async ({ name, username, avatar, _id }) => {
      const [groups, friends] = await Promise.all([
        ChatModel.countDocuments({ groupChat: true, members: _id }),
        ChatModel.countDocuments({ groupChat: false, members: _id }),
      ]);

      return {
        name,
        username,
        avatar: avatar?.url,
        _id,
        groups,
        friends,
      };
    }),
  );

  return res
    .status(200)
    .json(new ApiResponse(200, transformedUsers, "Success"));
});
const allChats = AsyncHandler(async (req, res, next) => {
  const chats = await ChatModel.find({})
    .populate("members", "name avatar")
    .populate("creator", "name avatar");

  const transformedChats = await Promise.all(
    chats.map(async ({ members, _id, groupChat, name, creator }) => {
      const totalMessages = await MessageModel.countDocuments({ chat: _id });

      return {
        _id,
        groupChat,
        name,
        avatar: members.slice(0, 3).map((member: any) => member.avatar.url),
        members: members.map(
          ({
            _id,
            name,
            avatar,
          }: {
            _id: string;
            name: string;
            avatar: { url: string };
          }) => ({
            _id,
            name,
            avatar: avatar.url,
          }),
        ),
        creator: {
          name: creator?.name || "None",
          avatar: creator?.avatar.url || "",
        },
        totalMembers: members.length,
        totalMessages,
      };
    }),
  );

  return res
    .status(200)
    .json(new ApiResponse(200, transformedChats, "Success"));
});
const allMessages = AsyncHandler(async (req, res, next) => {
  const messages = await MessageModel.find({})
    .populate("sender", "name avatar")
    .populate("chat", "groupChat");

  const transformedMessages = messages.map(
    ({ content, attachments, _id, sender, createdAt, chat }) => ({
      _id,
      attachments,
      content,
      createdAt,
      chat: chat._id,
      groupChat: chat.groupChat,
      sender: {
        _id: sender._id,
        name: sender.name,
        avatar: sender.avatar.url,
      },
    }),
  );

  return res
    .status(200)
    .json(new ApiResponse(200, transformedMessages, "Success"));
});
const getDashboardStats = AsyncHandler(async (req, res, next) => {
  const [groupsCount, usersCount, messagesCount, totalChatsCount] =
    await Promise.all([
      ChatModel.countDocuments({ groupChat: true }),
      UserModel.countDocuments(),
      MessageModel.countDocuments(),
      ChatModel.countDocuments(),
    ]);

  const today = new Date();

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const last7DaysMessages = await MessageModel.find({
    createdAt: {
      $gte: last7Days,
      $lte: today,
    },
  }).select("createdAt");

  const messages = new Array(7).fill(0);
  const dayInMiliseconds = 1000 * 60 * 60 * 24;

  last7DaysMessages.forEach((message) => {
    const indexApprox =
      (today.getTime() - message.createdAt.getTime()) / dayInMiliseconds;
    const index = Math.floor(indexApprox);

    messages[6 - index]++;
  });

  const stats = {
    groupsCount,
    usersCount,
    messagesCount,
    totalChatsCount,
    messagesChart: messages,
  };

  return res.status(200).json(new ApiResponse(200, stats, "Success"));
});

export {
  adminLogin,
  adminLogout,
  getAdminData,
  allUsers,
  allChats,
  allMessages,
  getDashboardStats,
};
