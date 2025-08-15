import { AsyncHandler } from "../utils/async-handler.util";

const adminLogin = AsyncHandler(async (req, res, next) => {
  //TODO
});
const adminLogout = AsyncHandler(async (req, res, next) => {
  //TODO
});
const getAdminData = AsyncHandler(async (req, res, next) => {
  //TODO
});
const allUsers = AsyncHandler(async (req, res, next) => {
  //TODO
});
const allChats = AsyncHandler(async (req, res, next) => {
  //TODO
});
const allMessages = AsyncHandler(async (req, res, next) => {
  //TODO
});
const getDashboardStats = AsyncHandler(async (req, res, next) => {
  //TODO
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
