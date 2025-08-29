import http from "http";
import { Application } from "express";
import { env } from "./env";
import { log } from "./logger";
import { connectDb } from "./db";
import { Server, Socket } from "socket.io";

import app from "./app";
import { initWebRTCSignallingServer, socketOnConection } from "./app/socket";
import { corsOptions } from "./app/constants/cors.constant";
import { socketAuthenticator } from "./app/socket/socket.middleware";

async function main(app: Application) {
  await connectDb(env.MONGO_URI);

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: corsOptions,
  });
  app.set("io", io);
  io.use(socketAuthenticator);
  io.on("connection", (socket) => {
    socketOnConection(io)(socket);
    initWebRTCSignallingServer(socket);
  });
  server
    .listen(env.PORT)
    .on("listening", () => {
      log.info(`Server is running on  PORT ${env.PORT}`);
    })
    .on("error", (err) => {
      log.error(err);
    });
}

main(app);
