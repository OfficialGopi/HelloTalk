import { AsyncHandler } from "../utils/async-handler.util";

const signup = AsyncHandler(async (req, res, next) => {
  //TODO
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
