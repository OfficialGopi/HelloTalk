import { ExtendedError, Socket } from "socket.io";
import { ApiError } from "../utils/response-formatter.util";
import { tokenFieldNames } from "../constants/cookie.constant";
import jwt from "jsonwebtoken";
import { env } from "../../env";

import { UserModel } from "../models/user.model";

const socketAuthenticator = async (
  err: any,
  socket: Socket,
  next: (err?: ExtendedError) => void,
) => {
  try {
    if (err) throw new ApiError(401, "Please login to access this route", err);

    const authToken = socket.request.cookies[tokenFieldNames.accessToken];

    if (!authToken)
      throw new ApiError(401, "Please login to access this route");

    const decodedData: any = jwt.verify(authToken, env.ACCESS_TOKEN_SECRET);

    const user = await UserModel.findById(decodedData._id);

    if (!user) throw new ApiError(401, "Please login to access this route");

    socket.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, "Please login to access this route");
  }
};

export { socketAuthenticator };
