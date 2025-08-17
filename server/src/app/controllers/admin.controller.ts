import { env } from "../../env";
import { cookieOptions, tokenFieldNames } from "../constants/cookie.constant";
import { AsyncHandler } from "../utils/async-handler.util";
import { ApiError, ApiResponse } from "../utils/response-formatter.util";
import jwt from "jsonwebtoken";

const adminLogin = AsyncHandler(async (req, res, next) => {
  const { secretKey } = req.body;

  const isMatched = secretKey === env.ADMIN_SECRET_KEY;

  if (!isMatched) throw new ApiError(401, "Invalid Admin Key");

  const token = jwt.sign(
    {
      secretKey: env.ADMIN_SECRET_KEY,
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
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        admin: true,
      },
      "Success",
    ),
  );
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
