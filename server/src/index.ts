import http from "http";
import { Application } from "express";
import { env } from "./env";
import { log } from "./logger";
import { connectDb } from "./db";
import { Server, Socket } from "socket.io";

import app from "./app";
import { socketAuthMiddleware, socketOnConection } from "./app/socket";
import { corsOptions } from "./app/constants/cors.constant";

async function main(app: Application) {
  await connectDb(env.MONGO_URI);

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: corsOptions,
  });
  io.use(socketAuthMiddleware);
  io.on("connection", socketOnConection(io));
  app.set("io", io);
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
