import mongoose from "mongoose";
import { IChat } from "../types/schemas.types";

const schema = new mongoose.Schema<IChat & mongoose.Document>(
  {
    name: {
      type: String,
      required: true,
    },
    groupChat: {
      type: Boolean,
      default: false,
    },
    creator: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    members: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const ChatModel = mongoose.model<IChat & mongoose.Document>(
  "Chat",
  schema,
);
