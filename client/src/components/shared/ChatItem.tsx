import React, { memo } from "react";
import AvatarCard from "./AvatarCard";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface ChatItemProps {
  avatar?: string[];
  name: string;
  _id: string;
  groupChat?: boolean;
  sameSender?: boolean;
  isOnline?: boolean;
  newMessageAlert?: { count: number };
  index?: number;
  handleDeleteChat?: (
    e: React.MouseEvent,
    id: string,
    groupChat: boolean
  ) => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  avatar = [],
  name,
  _id,
  groupChat = false,
  sameSender,
  isOnline,
  newMessageAlert,
  index = 0,
  handleDeleteChat,
}) => {
  return (
    <Link
      to={`/chat/${_id}`}
      onContextMenu={(e: React.MouseEvent) =>
        handleDeleteChat?.(e, _id, groupChat)
      }
      className="block w-full"
    >
      <motion.div
        initial={{ opacity: 0, y: -20, filter: "blur(4px)", scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
        transition={{ delay: 0.05 * index, duration: 0.3, ease: "easeOut" }}
        className={`relative flex items-center gap-4 p-4 rounded-md transition-colors 
          ${
            sameSender
              ? "bg-neutral-900 text-white"
              : "hover:bg-neutral-800 text-neutral-200"
          }`}
      >
        <AvatarCard avatar={avatar as any} />

        <div className="flex flex-col">
          <span className="text-sm font-medium">{name}</span>
          {newMessageAlert && (
            <span className="text-xs text-neutral-400">
              {newMessageAlert.count} New Message
            </span>
          )}
        </div>

        {isOnline && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-green-500 rounded-full"></span>
        )}
      </motion.div>
    </Link>
  );
};

export default memo(ChatItem);
