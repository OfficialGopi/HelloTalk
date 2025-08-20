import { Server, Socket } from "socket.io";
import cookieParser from "cookie-parser";
import { socketAuthenticator } from "./socket.middleware";
import { Request, Response } from "express";
import { getSockets } from "./socket.helper";
import { MessageModel } from "../models/message.model";
import { events } from "../constants/events.constant";

const {
  CHAT_JOINED,
  CHAT_LEAVED,
  NEW_MESSAGE_ALERT,
  NEW_MESSAGE,
  START_TYPING,
  STOP_TYPING,
  ONLINE_USERS,
} = events;

const userSocketIDs = new Map();
const onlineUsers = new Set();

const socketAuthMiddleware = (socket: Socket, next: any) => {
  cookieParser()(
    socket.request as Request,
    {} as Response,
    async (err) => await socketAuthenticator(err, socket, next),
  );
};

const socketOnConection = (io: Server) => (socket: Socket) => {
  const user = socket.user!;
  userSocketIDs.set(user!._id.toString(), socket.id);

  socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
    const messageForRealTime = {
      content: message,
      sender: {
        _id: user._id,
        name: user.name,
      },
      chat: chatId,
      createdAt: new Date().toISOString(),
    };

    const messageForDB = {
      content: message,
      sender: user._id,
      chat: chatId,
    };

    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(NEW_MESSAGE, {
      chatId,
      message: messageForRealTime,
    });
    io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

    try {
      await MessageModel.create(messageForDB);
    } catch (error) {
      throw new Error(error as unknown as string);
    }
  });

  socket.on(START_TYPING, ({ members, chatId }) => {
    const membersSockets = getSockets(members);
    socket.to(membersSockets).emit(START_TYPING, { chatId });
  });

  socket.on(STOP_TYPING, ({ members, chatId }) => {
    const membersSockets = getSockets(members);
    socket.to(membersSockets).emit(STOP_TYPING, { chatId });
  });

  socket.on(CHAT_JOINED, ({ userId, members }) => {
    onlineUsers.add(userId.toString());

    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
  });

  socket.on(CHAT_LEAVED, ({ userId, members }) => {
    onlineUsers.delete(userId.toString());

    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
  });

  socket.on("disconnect", () => {
    userSocketIDs.delete(user._id.toString());
    onlineUsers.delete(user._id.toString());
    socket.broadcast.emit(ONLINE_USERS, Array.from(onlineUsers));
  });
};

export { userSocketIDs, onlineUsers, socketAuthMiddleware, socketOnConection };
