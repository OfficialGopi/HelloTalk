import { Response } from "express";
import { IUser } from "../types/schemas.types";
import { cookieOptions, tokenFieldNames } from "../constants/cookie.constant";
import { ApiResponse } from "./response-formatter.util";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../../env";

const sendToken = (
  res: Response,
  user: Partial<IUser>,
  code: number = 200,
  message: string = "Success",
) => {
  const token = jwt.sign({ userId: user._id }, env.USER_TOKEN_SECRET, {
    expiresIn: env.USER_TOKEN_EXPIRY,
  } as SignOptions);

  return res
    .status(code)
    .cookie(tokenFieldNames.userToken, token, cookieOptions)
    .json(new ApiResponse(code, user, message));
};

export { sendToken };
