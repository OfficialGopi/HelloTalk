// types/global.d.ts
import { IncomingMessage } from "http";
import { IUser } from "./schemas.types";

declare module "http" {
  interface IncomingMessage {
    cookies: { [key: string]: string };
    signedCookies?: { [key: string]: string };
  }
}
declare module "socket.io" {
  interface Socket {
    user?: {
      _id: string;
      name: string;
    };
  }
}

declare module "express" {
  interface Request {
    user?: Partial<IUser>;
  }
}
