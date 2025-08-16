import { events } from "../constants/events.constant";
import { ChatModel } from "../models/chat.model";
import { AsyncHandler } from "../utils/async-handler.util";
import { emitEvent, getOtherMember } from "../utils/socket.util";
import { ApiError, ApiResponse } from "../utils/response-formatter.util";
import { IUser } from "../types/schemas.types";
import { UserModel } from "../models/user.model";
import { MessageModel } from "../models/message.model";
import { uploadOnCloudinary } from "../libs/cloudinary.lib";

const {
  ALERT,
  CHAT_JOINED,
  CHAT_LEAVED,
  NEW_ATTACHMENT,
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  NEW_REQUEST,
  ONLINE_USERS,
  REFETCH_CHATS,
  START_TYPING,
  STOP_TYPING,
} = events;

const newGroupChat = AsyncHandler(async (req, res) => {
  const { name, members } = req.body;

  const allMembers = [...members, req.user!._id];

  await ChatModel.create({
    name,
    groupChat: true,
    creator: req.user!._id,
    members: allMembers,
  });

  emitEvent(req, ALERT, allMembers, `Welcome to ${name} group`);
  emitEvent(req, REFETCH_CHATS, members);

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Chat created successfully"));
});
const getMyChats = AsyncHandler(async (req, res) => {
  const chats = await ChatModel.find({ members: req.user!._id }).populate(
    "members",
    "name avatar",
  );

  const transformedChats = chats.map(({ _id, name, members, groupChat }) => {
    const otherMember = getOtherMember(members, req.user!);

    return {
      _id,
      groupChat,
      avatar: groupChat
        ? members
            .slice(0, 3)
            .map(({ avatar }: { avatar: { url: string } }) => avatar.url)
        : [otherMember?.avatar?.url],
      name: groupChat ? name : otherMember?.name,
      members: members.reduce((prev: string[], curr: Partial<IUser>) => {
        if (curr._id!.toString() !== req.user!._id!.toString()) {
          prev.push(curr._id!.toString());
        }
        return prev;
      }, []),
    };
  });

  return res
    .status(200)
    .json(new ApiResponse(200, transformedChats, "Success"));
});
const getMyGroups = AsyncHandler(async (req, res, next) => {
  const chats = await ChatModel.find({
    members: req.user!._id,
    groupChat: true,
    creator: req.user!._id,
  }).populate("members", "name avatar");

  const groups = chats.map(({ members, _id, groupChat, name }) => ({
    _id,
    groupChat,
    name,
    avatar: members
      .slice(0, 3)
      .map(({ avatar }: { avatar: { url: string } }) => avatar.url),
  }));

  return res.status(200).json(new ApiResponse(200, groups, "Success"));
});
const addMembers = AsyncHandler(async (req, res, next) => {
  const { chatId, members } = req.body;

  const chat = await ChatModel.findById(chatId);

  if (!chat) throw new ApiError(404, "Chat not found");

  if (!chat.groupChat) throw new ApiError(400, "This is not a group chat");

  if (chat.creator.toString() !== req.user!._id!.toString())
    throw new ApiError(403, "You are not allowed to add members");

  const allNewMembersPromise = members.map((i: string) =>
    UserModel.findById(i, "name"),
  );

  const allNewMembers = await Promise.all(allNewMembersPromise);

  const uniqueMembers = allNewMembers
    .filter((i) => !chat.members.includes(i._id.toString()))
    .map((i) => i._id);

  chat.members.push(...uniqueMembers);

  if (chat.members.length > 100)
    throw new ApiError(400, "Group members limit reached");

  await chat.save();

  const allUsersName = allNewMembers.map((i) => i.name).join(", ");

  emitEvent(
    req,
    ALERT,
    chat.members,
    `${allUsersName} has been added in the group`,
  );

  emitEvent(req, REFETCH_CHATS, chat.members);

  return res.status(200).json(new ApiResponse(200, {}, "Success"));
});
const removeMember = AsyncHandler(async (req, res, next) => {
  const { userId, chatId } = req.body;

  const [chat, userThatWillBeRemoved] = await Promise.all([
    ChatModel.findById(chatId),
    UserModel.findById(userId, "name"),
  ]);

  if (!chat) throw new ApiError(404, "Chat not found");

  if (!chat.groupChat) throw new ApiError(400, "This is not a group chat");

  if (chat.creator.toString() !== req.user!._id!.toString())
    throw new ApiError(403, "You are not allowed to add members");

  if (chat.members.length <= 3)
    throw new ApiError(400, "Group must have at least 3 members");

  const allChatMembers = chat.members.map((i: string) => i.toString());

  chat.members = chat.members.filter(
    (member: string) => member.toString() !== userId.toString(),
  );

  await chat.save();

  emitEvent(req, ALERT, chat.members, {
    message: `${userThatWillBeRemoved.name} has been removed from the group`,
    chatId,
  });

  emitEvent(req, REFETCH_CHATS, allChatMembers);

  return res.status(200).json(new ApiResponse(200, {}, "Success"));
});
const leaveGroup = AsyncHandler(async (req, res, next) => {
  const chatId = req.params.id;

  const chat = await ChatModel.findById(chatId);

  if (!chat) throw new ApiError(404, "Chat not found");

  if (!chat.groupChat) throw new ApiError(400, "This is not a group chat");

  const remainingMembers = chat.members.filter(
    (member: string) => member.toString() !== req.user!._id!.toString(),
  );

  if (remainingMembers.length < 3)
    throw new ApiError(404, "Group must have at least 3 members");

  if (chat.creator.toString() === req.user!._id!.toString()) {
    const randomElement = Math.floor(Math.random() * remainingMembers.length);
    const newCreator = remainingMembers[randomElement];
    chat.creator = newCreator;
  }

  chat.members = remainingMembers;

  const [user] = await Promise.all([
    UserModel.findById(req.user!._id!, "name"),
    chat.save(),
  ]);

  emitEvent(req, ALERT, chat.members, {
    chatId,
    message: `User ${user.name} has left the group`,
  });

  return res.status(200).json({
    success: true,
    message: "Leave Group Successfully",
  });
});
const sendAttachments = AsyncHandler(async (req, res, next) => {
  const { chatId } = req.body;

  const files = (req.files || []) as Express.Multer.File[];

  if (files.length < 1) throw new ApiError(400, "Please Upload Attachments");

  if (files.length > 5) throw new ApiError(400, "Files Can't be more than 5");

  const [chat, me] = await Promise.all([
    ChatModel.findById(chatId),
    UserModel.findById(req.user!._id!, "name"),
  ]);

  if (!chat) throw new ApiError(404, "Chat not found");

  if (files.length < 1) throw new ApiError(400, "Please provide attachments");

  //   Upload files here
  let attachments: { public_id: string; url: string }[] = [];

  for (const file of files) {
    const response = await uploadOnCloudinary(file.path);
    if (response) attachments.push(response);
  }

  if (attachments.length < 1) throw new ApiError(500, "Failed to upload files");

  const messageForDB = {
    content: "",
    attachments,
    sender: me._id,
    chat: chatId,
  };

  const messageForRealTime = {
    ...messageForDB,
    sender: {
      _id: me._id,
      name: me.name,
    },
  };

  const message = await MessageModel.create(messageForDB);

  emitEvent(req, NEW_MESSAGE, chat.members, {
    message: messageForRealTime,
    chatId,
  });

  emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { chatId });

  return res.status(200).json(new ApiResponse(200, {}, "Success"));
});
const getMessages = AsyncHandler(async (req, res, next) => {
  const chatId = req.params.id;
  const page: number = Number(req.query.page) ?? 1;

  const resultPerPage = 20;
  const skip = (page - 1) * resultPerPage;

  const chat = await ChatModel.findById(chatId);

  if (!chat) throw new ApiError(404, "Chat not found");

  if (!chat.members.includes(req.user!._id!.toString()))
    throw new ApiError(403, "You are not allowed to access this chat");

  const [messages, totalMessagesCount] = await Promise.all([
    MessageModel.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(resultPerPage)
      .populate("sender", "name")
      .lean(),
    MessageModel.countDocuments({ chat: chatId }),
  ]);

  const totalPages = Math.ceil(totalMessagesCount / resultPerPage) || 0;

  return res.status(200).json({
    success: true,
    messages: messages.reverse(),
    totalPages,
  });
});
const getChatDetails = AsyncHandler(async (req, res, next) => {
  //TODO
});
const renameGroup = AsyncHandler(async (req, res, next) => {
  //TODO
});
const deleteChat = AsyncHandler(async (req, res, next) => {
  //TODO
});

export {
  newGroupChat,
  getMyChats,
  getMyGroups,
  addMembers,
  removeMember,
  leaveGroup,
  sendAttachments,
  getMessages,
  getChatDetails,
  renameGroup,
  deleteChat,
};
