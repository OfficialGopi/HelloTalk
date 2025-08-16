import { events } from "../constants/events.constant";
import { ChatModel } from "../models/chat.model";
import { AsyncHandler } from "../utils/async-handler.util";
import { emitEvent, getOtherMember } from "../utils/socket.util";
import { ApiError, ApiResponse } from "../utils/response-formatter.util";
import { IUser } from "../types/schemas.types";
import { UserModel } from "../models/user.model";

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
  //TODO
});
const leaveGroup = AsyncHandler(async (req, res, next) => {
  //TODO
});
const sendAttachments = AsyncHandler(async (req, res, next) => {
  //TODO
});
const getMessages = AsyncHandler(async (req, res, next) => {
  //TODO
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
