import express from "express";
import { checkUserIfLoggedIn } from "../middlewares/auth.middleware";
import { uploadAttachments } from "../middlewares/file-handling.middleware";
import {
  addMembers,
  deleteChat,
  getChatDetails,
  getMessages,
  getMyChats,
  getMyGroups,
  leaveGroup,
  newGroupChat,
  removeMember,
  renameGroup,
  sendAttachments,
} from "../controllers/chat.controller";

const chatRouter = express.Router();

// User Must be authenticated
chatRouter.use(checkUserIfLoggedIn); // check if user is logged in

chatRouter.post("/new", newGroupChat);

chatRouter.get("/my", getMyChats);

chatRouter.get("/my/groups", getMyGroups);

chatRouter.put("/add-members", addMembers);

chatRouter.put("/remove-member", removeMember);

chatRouter.delete("/leave/:id", leaveGroup);

// Send Attachments
chatRouter.post("/message", uploadAttachments, sendAttachments);

// Get Messages
chatRouter.get("/message/:id", getMessages);

// Get Chat Details, rename,delete
chatRouter
  .route("/:id")
  .get(getChatDetails)
  .put(renameGroup)
  .delete(deleteChat);

export default chatRouter;
