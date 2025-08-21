import { env } from "../../env";
import { tokenFieldNames } from "../constants/cookie.constant";
import { UserModel } from "../models/user.model";
import { AsyncHandler } from "../utils/async-handler.util";
import { ApiError } from "../utils/response-formatter.util";
import jwt from "jsonwebtoken";

const checkUserIfLoggedIn = AsyncHandler(async (req, res, next) => {
  const token = req.cookies[tokenFieldNames.userToken];
  if (!token) throw new ApiError(401, "Please login to access this route");

  const decodedData = jwt.verify(token, env.USER_TOKEN_SECRET) as {
    userId: string;
  } & jwt.JwtPayload;

  if (!decodedData.userId)
    throw new ApiError(401, "Please login to access this route");

  if (decodedData.exp! < Date.now() / 1000) {
    res.clearCookie(tokenFieldNames.userToken);
    throw new ApiError(401, "Please login to access this route");
  }

  const user = await UserModel.findById(decodedData.userId);

  if (!user) throw new ApiError(401, "Please login to access this route");

  req.user = user;

  next();
});

const isAdmin = AsyncHandler(async (req, res, next) => {
  const token = req.cookies[tokenFieldNames.adminToken];

  if (!token) throw new ApiError(401, "Only Admin can access this route");

  const secretKey = jwt.verify(token, env.ADMIN_TOKEN_SECRET) as {
    adminSecretKey: string;
  } & jwt.JwtPayload;

  if (secretKey.exp! < Date.now() / 1000) {
    res.clearCookie(tokenFieldNames.adminToken);
    throw new ApiError(401, "Only Admin can access this route");
  }

  const isMatched =
    secretKey.adminSecretKey?.toString() === env.ADMIN_SECRET_KEY.toString();

  if (!isMatched) throw new ApiError(401, "Only Admin can access this route");

  next();
});

export { checkUserIfLoggedIn, isAdmin };
