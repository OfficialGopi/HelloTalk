import React from "react";
import ChatItem from "../shared/ChatItem";

interface Chat {
  _id: string;
  name: string;
  avatar?: string[];
  groupChat?: boolean;
  members?: string[];
}

interface NewMessageAlert {
  chatId: string;
  count: number;
}

interface ChatListProps {
  w?: string;
  chats: Chat[];
  chatId?: string;
  onlineUsers?: string[];
  newMessagesAlert?: NewMessageAlert[];
  handleDeleteChat?: any;
}

const ChatList: React.FC<ChatListProps> = ({
  chats = [],
  chatId,
  onlineUsers = [],
  newMessagesAlert = [],
  handleDeleteChat,
}: ChatListProps) => {
  return (
    <div className="flex flex-col bg-neutral-100 dark:bg-neutral-950 overflow-y-scroll h-full [scrollbar-width:none]">
      {chats.map((data, index) => {
        const { avatar, _id, name, groupChat, members } = data;

        const newMessageAlert = newMessagesAlert.find(
          (alert) => alert.chatId === _id
        );

        const isOnline = members?.some((member) =>
          onlineUsers.includes(member)
        );

        return (
          <ChatItem
            index={index}
            newMessageAlert={newMessageAlert}
            isOnline={isOnline}
            avatar={avatar}
            name={name}
            _id={_id}
            key={_id}
            groupChat={groupChat}
            sameSender={chatId === _id}
            handleDeleteChat={handleDeleteChat}
          />
        );
      })}
    </div>
  );
};

export default ChatList;
