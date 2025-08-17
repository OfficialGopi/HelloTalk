import { uploadOnCloudinary } from "../libs/cloudinary.lib";
import { UserModel } from "../models/user.model";
import { AsyncHandler } from "../utils/async-handler.util";
import { ApiError } from "../utils/response-formatter.util";
import { sendToken } from "../utils/sendToken.util";

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
  //TODO
});
const logout = AsyncHandler(async (req, res, next) => {
  //TODO
});
const searchUser = AsyncHandler(async (req, res, next) => {
  //TODO
});
const sendFriendRequest = AsyncHandler(async (req, res, next) => {
  //TODO
});

const acceptFriendRequest = AsyncHandler(async (req, res, next) => {
  //TODO
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
