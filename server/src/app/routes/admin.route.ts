import express from "express";
import {
  adminLogin,
  adminLogout,
  allChats,
  allMessages,
  allUsers,
  getAdminData,
  getDashboardStats,
} from "../controllers/admin.controller";
import { isAdmin } from "../middlewares/auth.middleware";

const adminRouter = express.Router();
adminRouter.post("/verify", adminLogin);

adminRouter.get("/logout", adminLogout);

// Only Admin Can Accecss these Routes
adminRouter.use(isAdmin);

adminRouter.get("/", getAdminData);
adminRouter.get("/users", allUsers);
adminRouter.get("/chats", allChats);
adminRouter.get("/messages", allMessages);
adminRouter.get("/stats", getDashboardStats);

export default adminRouter;
