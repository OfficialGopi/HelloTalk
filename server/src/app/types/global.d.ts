// types/global.d.ts
import { IncomingMessage } from "http";

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
