import express from "express";
import { uploadSingleAvatar } from "../middlewares/file-handling.middleware";
import {
  acceptFriendRequest,
  getMyFriends,
  getMyNotifications,
  getUserProfile,
  login,
  logout,
  searchUser,
  sendFriendRequest,
  signup,
} from "../controllers/user.controller";
import { checkUserIfLoggedIn } from "../middlewares/auth.middleware";

const userRouter = express.Router();

userRouter.post("/signup", uploadSingleAvatar, signup);
userRouter.post("/login", login);

// User Must be authenticated
userRouter.use(checkUserIfLoggedIn); // check if user is logged in

userRouter.get("/me", getUserProfile);

userRouter.get("/logout", logout);

userRouter.get("/search", searchUser);

userRouter.put("/send-request", sendFriendRequest);

userRouter.put("/accept-request", acceptFriendRequest);

userRouter.get("/notifications", getMyNotifications);

userRouter.get("/friends", getMyFriends);

export default userRouter;
