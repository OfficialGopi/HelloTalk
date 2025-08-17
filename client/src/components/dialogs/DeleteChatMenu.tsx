import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { setIsDeleteMenu } from "../../redux/reducers/misc";
import { useNavigate } from "react-router-dom";
import { useAsyncMutation } from "../../hooks/hook";
import {
  useDeleteChatMutation,
  useLeaveGroupMutation,
} from "../../redux/api/api";
import { Trash2, LogOut } from "lucide-react";

interface DeleteChatMenuProps {
  dispatch: any;
  deleteMenuAnchor: React.MutableRefObject<HTMLDivElement | null>;
}

const DeleteChatMenu: React.FC<DeleteChatMenuProps> = ({
  dispatch,
  deleteMenuAnchor,
}) => {
  const navigate = useNavigate();

  const { isDeleteMenu, selectedDeleteChat } = useSelector(
    (state: any) => state.misc
  );

  const [deleteChat, , deleteChatData]: any = useAsyncMutation(
    useDeleteChatMutation
  );
  const [leaveGroup, , leaveGroupData]: any = useAsyncMutation(
    useLeaveGroupMutation
  );

  const isGroup = selectedDeleteChat?.groupChat;

  const closeHandler = () => {
    dispatch(setIsDeleteMenu(false));
    deleteMenuAnchor.current = null;
  };

  const leaveGroupHandler = () => {
    closeHandler();
    leaveGroup("Leaving Group...", selectedDeleteChat.chatId);
  };

  const deleteChatHandler = () => {
    closeHandler();
    deleteChat("Deleting Chat...", selectedDeleteChat.chatId);
  };

  useEffect(() => {
    if (deleteChatData || leaveGroupData) navigate("/");
  }, [deleteChatData, leaveGroupData]);

  // Menu positioning relative to anchor
  const anchorRect = deleteMenuAnchor.current?.getBoundingClientRect();

  return (
    <AnimatePresence>
      {isDeleteMenu && anchorRect && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -8 }}
          transition={{ duration: 0.2 }}
          className="fixed z-50"
          style={{
            top: anchorRect.bottom + 6,
            left: anchorRect.right - 160, // width offset so it aligns to right
          }}
        >
          <div
            className="w-40 rounded-md bg-neutral-900 shadow-lg border border-neutral-700 overflow-hidden"
            onClick={isGroup ? leaveGroupHandler : deleteChatHandler}
          >
            <div className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-800 cursor-pointer">
              {isGroup ? (
                <>
                  <LogOut size={18} className="text-neutral-200" />
                  <span className="text-sm text-neutral-200">Leave Group</span>
                </>
              ) : (
                <>
                  <Trash2 size={18} className="text-red-400" />
                  <span className="text-sm text-neutral-200">Delete Chat</span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteChatMenu;
