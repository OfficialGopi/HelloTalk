import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { IUser } from "../types/schemas.types";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../../env";

const schema = new mongoose.Schema<
  IUser & {
    comparePassword: (password: string) => Promise<boolean>;
  } & mongoose.Document
>(
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

schema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};
schema.methods.generateUserToken = function () {
  return jwt.sign({ _id: this._id }, env.USER_TOKEN_SECRET, {
    expiresIn: env.USER_TOKEN_EXPIRY,
  } as SignOptions);
};

export const UserModel = mongoose.model<
  IUser & {
    comparePassword: (password: string) => Promise<boolean>;
  } & mongoose.Document
>("User", schema);
