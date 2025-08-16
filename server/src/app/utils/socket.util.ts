import { Request } from "express";
import { getSockets } from "../socket/socket.helper";
import { Server } from "socket.io";
import { IUser } from "../types/schemas.types";

const emitEvent = (
  req: Request,
  event: string,
  users: string[],
  data: any = null,
) => {
  const io: Server = req.app.get("io");
  const usersSocket = getSockets(users);
  io.to(usersSocket).emit(event, data);
};

const getOtherMember = (members: Partial<IUser>[], user: Partial<IUser>) =>
  members.find((member) => member._id!.toString() !== user._id!.toString());

export { emitEvent, getOtherMember };
