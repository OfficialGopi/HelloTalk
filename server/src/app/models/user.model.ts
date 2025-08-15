import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { IUser } from "../types/schemas.types";
import { USER_ROLES, USER_ROLES_ENUM } from "../constants/roles.constant";

const schema = new mongoose.Schema<IUser & mongoose.Document>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: USER_ROLES_ENUM,
      default: USER_ROLES.USER,
    },

    bio: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  },
);

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
});

export const UserModel =
  mongoose.models.User ||
  mongoose.model<IUser & mongoose.Document>("users", schema);
