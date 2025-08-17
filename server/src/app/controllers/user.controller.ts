import { tokenFieldNames } from "../constants/cookie.constant";
import { events } from "../constants/events.constant";
import { uploadOnCloudinary } from "../libs/cloudinary.lib";
import { ChatModel } from "../models/chat.model";
import { RequestModel } from "../models/request.model";
import { UserModel } from "../models/user.model";
import { sanitizeUser } from "../services/model.service";
import { AsyncHandler } from "../utils/async-handler.util";
import { ApiError, ApiResponse } from "../utils/response-formatter.util";
import { sendToken } from "../utils/sendToken.util";
import { emitEvent } from "../utils/socket.util";

const { NEW_REQUEST } = events;

const signup = AsyncHandler(async (req, res, next) => {
  const { name, username, password, bio } = req.body;

  const file = req.file;

  if (!file) throw new ApiError(400, "Please Upload Avatar");

  const result = await uploadOnCloudinary(file.path);

  let avatar: { public_id: string; url: string } | null = null;

  if (result && result?.public_id && result?.url) {
    avatar = {
      public_id: result.public_id,
      url: result.url,
    };
  }

  const user = await UserModel.create({
    name,
    bio,
    username,
    password,
    avatar,
  });

  sendToken(res, user, 201, "User created");
});
const login = AsyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  const user = await UserModel.findOne({ username }).select("+password");

  if (!user) throw new ApiError(404, "Invalid Username or Password");

  const isMatch = await user.comparePassword(password);

  if (!isMatch) throw new ApiError(404, "Invalid Username or Password");

  sendToken(res, user, 200, `Welcome Back, ${user.name}`);
});
const getUserProfile = AsyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user?._id);

  if (!user) throw new ApiError(404, "User not found");

  res.status(200).json(new ApiResponse(200, sanitizeUser(user), "Success"));
});
const logout = AsyncHandler(async (req, res, next) => {
  return res
    .status(200)
    .clearCookie(tokenFieldNames.userToken)
    .json(new ApiResponse(200, {}, "Success"));
});
const searchUser = AsyncHandler(async (req, res, next) => {
  const { name = "" } = req.query;

  // Finding All my chats
  const myChats = await ChatModel.find({
    groupChat: false,
    members: req.user?._id,
  });

  //  extracting All Users from my chats means friends or people I have chatted with
  const allUsersFromMyChats = myChats.flatMap((chat) => chat.members);

  // Finding all users except me and my friends
  const allUsersExceptMeAndFriends = await UserModel.find({
    _id: { $nin: allUsersFromMyChats },
    name: { $regex: name, $options: "i" },
  });

  // Modifying the response
  const users = allUsersExceptMeAndFriends.map(({ _id, name, avatar }) => ({
    _id,
    name,
    avatar: avatar?.url,
  }));

  return res.status(200).json(new ApiResponse(200, users, "Success"));
});
const sendFriendRequest = AsyncHandler(async (req, res, next) => {
  const { userId } = req.body;

  const request = await RequestModel.findOne({
    $or: [
      { sender: req.user?._id, receiver: userId },
      { sender: userId, receiver: req.user?._id },
    ],
  });

  if (request) throw new ApiError(400, "Request already sent");

  await RequestModel.create({
    sender: req.user?._id,
    receiver: userId,
  });

  emitEvent(req, NEW_REQUEST, [userId]);

  return res.status(200).json(new ApiResponse(200, {}, "Success"));
});

const acceptFriendRequest = AsyncHandler(async (req, res, next) => {
  const { requestId, accept } = req.body;

  const request = await RequestModel.findById(requestId)
    .populate("sender", "name")
    .populate("receiver", "name");

  if (!request) throw new ApiError(404, "Request not found");

  if (request.receiver._id.toString() !== req.user?._id?.toString())
    throw new ApiError(401, "You are not authorized to accept this request");

  if (!accept) {
    await request.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Friend Request Rejected",
    });
  }
});

const getMyNotifications = AsyncHandler(async (req, res, next) => {
  //TODO
});
const getMyFriends = AsyncHandler(async (req, res, next) => {
  //TODO
});

export {
  signup,
  login,
  getUserProfile,
  logout,
  searchUser,
  sendFriendRequest,
  acceptFriendRequest,
  getMyNotifications,
  getMyFriends,
};
