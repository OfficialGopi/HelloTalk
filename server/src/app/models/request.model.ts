import mongoose from "mongoose";
import { IRequest } from "../types/schemas.types";

const schema = new mongoose.Schema<IRequest & mongoose.Document>(
  {
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "accepted", "rejected"],
    },

    sender: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true,
    },
    receiver: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const RequestModel =
  mongoose.models.Request ||
  mongoose.model<IRequest & mongoose.Document>("requests", schema);
