import http from "http";
import { Application } from "express";
import { env } from "./env";
import { log } from "./logger";
import app from "./app";
import { connectDb } from "./db";

async function main(app: Application) {
  await connectDb(env.MONGO_URI);

  const server = http.createServer(app);

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
