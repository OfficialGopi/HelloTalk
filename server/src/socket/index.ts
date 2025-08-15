import { Server } from "socket.io";
import { corsOptions } from "../app/constants/cors.constant";

const io = new Server({
  cors: corsOptions,
});

export { io };
