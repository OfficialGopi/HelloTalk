import { Request } from "express";
import { getSockets } from "../socket/socket.helper";
import { userSocketIDs } from "../socket";

const emitEvent = (req: Request, event: string, users: string[], data: any) => {
  const io = req.app.get("io");
  const usersSocket = getSockets(users);
  io.to(usersSocket).emit(event, data);
};

export { emitEvent };
