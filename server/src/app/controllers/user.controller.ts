import { uploadOnCloudinary } from "../libs/cloudinary.lib";
import { UserModel } from "../models/user.model";
import { AsyncHandler } from "../utils/async-handler.util";
import { ApiError } from "../utils/response-formatter.util";

const signup = AsyncHandler(async (req, res, next) => {
  const { name, username, password, bio, email } = req.body;

  const file = req.file;

  let avatar;

  if (file) {
    const result = await uploadOnCloudinary(file.path);

    if (!result) {
      throw new ApiError(500, "Failed to upload image to cloudinary");
    }

    avatar = {
      public_id: result.public_id,
      url: result.url,
    };
  }

  const user = await UserModel.create({
    name,
    email,
    bio,
    username,
    password,
    avatar,
  });
});
const login = AsyncHandler(async (req, res, next) => {
  //TODO
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
