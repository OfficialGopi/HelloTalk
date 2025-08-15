import mongoose from "mongoose";
import { USER_ROLES_ENUM } from "../constants/roles.constant";

interface IUser {
  _id: mongoose.Schema.Types.ObjectId;
  name: string;
  role: (typeof USER_ROLES_ENUM)[number];
  email: string;
  bio: string;
  username: string;
  password: string;
  avatar?: {
    public_id: string;
    url: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

interface IRequest {
  _id: mongoose.Schema.Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
  sender: mongoose.Schema.Types.ObjectId;
  receiver: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface IMessage {
  _id: mongoose.Schema.Types.ObjectId;
  content: string;
  attachments: {
    public_id: string;
    url: string;
  }[];
  sender: mongoose.Schema.Types.ObjectId;
  chat: mongoose.Schema.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

interface IChat {
  _id: mongoose.Schema.Types.ObjectId;
  name: string;
  groupChat: boolean;
  creator: mongoose.Schema.Types.ObjectId;
  members: mongoose.Schema.Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}
export { IUser, IRequest, IMessage, IChat };
