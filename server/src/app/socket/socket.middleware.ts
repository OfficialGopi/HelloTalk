import { ExtendedError, Socket } from "socket.io";
import { ApiError } from "../utils/response-formatter.util";
import { tokenFieldNames } from "../constants/cookie.constant";
import jwt from "jsonwebtoken";
import { env } from "../../env";

import { UserModel } from "../models/user.model";
import Cookies from "cookies";
import { Request } from "express";
const socketAuthenticator = async (
  socket: Socket,
  next: (err?: ExtendedError) => void,
) => {
  try {
    const cookies = new Cookies(
      socket.request as Request,
      (socket.request as Request).res!,
      {
        secure: true,
      },
    );

    const authToken = cookies.get(tokenFieldNames.userToken);

    if (!authToken)
      throw new ApiError(401, "Please login to access this route");

    const decodedData: any = jwt.verify(authToken, env.USER_TOKEN_SECRET);

    if (decodedData.exp! < Date.now() / 1000) {
      cookies.set(tokenFieldNames.userToken, undefined);
      throw new ApiError(401, "Please login to access this route");
    }

    const user = await UserModel.findById(decodedData.userId);

    if (!user) throw new ApiError(401, "Please login to access this route");

    socket.user = user as unknown as {
      _id: string;
      name: string;
      [key: string]: any;
    };
    next();
  } catch (error) {
    next(new ApiError(401, "Something went wrong"));
  }
};

export { socketAuthenticator };
