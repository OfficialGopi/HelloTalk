import mongoose from "mongoose";
import { IMessage } from "../types/schemas.types";

const schema = new mongoose.Schema<IMessage & mongoose.Document>(
  {
    content: String,

    attachments: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],

    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat: {
      type: mongoose.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const MessageModel = mongoose.model<IMessage & mongoose.Document>(
  "Message",
  schema,
);
