import { Request } from "express";
import { getSockets } from "../socket/socket.helper";
import { Server } from "socket.io";

const emitEvent = (req: Request, event: string, users: string[], data: any) => {
  const io: Server = req.app.get("io");
  const usersSocket = getSockets(users);
  io.to(usersSocket).emit(event, data);
};

export { emitEvent };
