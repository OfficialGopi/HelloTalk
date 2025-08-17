import React from "react";
import ChatItem from "@/components/shared/ChatItem";
import { motion, AnimatePresence } from "framer-motion";

interface ChatListProps {
  w?: string;
  chats?: any[];
  chatId?: string;
  onlineUsers?: string[];
  newMessagesAlert?: { chatId: string; count: number }[];
  handleDeleteChat?: (
    e: React.MouseEvent,
    id: string,
    groupChat: boolean
  ) => void;
}

const ChatList: React.FC<ChatListProps> = ({
  w = "100%",
  chats = [],
  chatId,
  onlineUsers = [],
  newMessagesAlert = [{ chatId: "", count: 0 }],
  handleDeleteChat,
}) => {
  return (
    <div className="flex flex-col overflow-y-auto h-full" style={{ width: w }}>
      <AnimatePresence>
        {chats?.map((data, index) => {
          const { avatar, _id, name, groupChat, members } = data;

          const newMessageAlert = newMessagesAlert.find(
            ({ chatId: id }) => id === _id
          );

          const isOnline = members?.some((member: string) =>
            onlineUsers.includes(member)
          );

          return (
            <motion.div
              key={_id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <ChatItem
                index={index}
                newMessageAlert={newMessageAlert}
                isOnline={isOnline}
                avatar={avatar}
                name={name}
                _id={_id}
                groupChat={groupChat}
                sameSender={chatId === _id}
                handleDeleteChat={handleDeleteChat}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ChatList;
