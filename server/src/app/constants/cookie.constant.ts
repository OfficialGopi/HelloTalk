import { CookieOptions } from "express";

const cookieOptions = {
  sameSite: "none",
  httpOnly: true,
  secure: true,
} as CookieOptions;

const tokenFieldNames = {
  userToken: "user-token",
  adminToken: "admin-token",
};

export { cookieOptions, tokenFieldNames };
