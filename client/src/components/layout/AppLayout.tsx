import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { events } from "../../constants/events";
import { useErrors, useSocketEvents } from "@/hooks/hook";
import { getOrSaveFromStorage } from "@/utils/features";
import { useMyChatsQuery } from "../../redux/api/api";
import {
  incrementNotification,
  setNewMessagesAlert,
} from "../../redux/reducers/chat";
import {
  setIsDeleteMenu,
  setIsMobile,
  setSelectedDeleteChat,
} from "../../redux/reducers/misc";
import { getSocket } from "@/lib/Socket";
import DeleteChatMenu from "@/components/dialogs/DeleteChatMenu";
import Title from "@/components/shared/Title";
import ChatList from "@/components/specific/ChatList";
import Profile from "@/components/specific/Profile";
import Header from "../shared/Header";
import { motion } from "motion/react";

const { NEW_MESSAGE_ALERT, NEW_REQUEST, ONLINE_USERS, REFETCH_CHATS } = events;

const AppLayout = () => (WrappedComponent?: React.FC<any>) => (props: any) => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = getSocket();

  const chatId = params.chatId;
  const deleteMenuAnchor = useRef<HTMLDivElement | null>(null);

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const { isMobile } = useSelector((state: any) => state.misc);
  const { user } = useSelector((state: any) => state.auth);
  const { newMessagesAlert } = useSelector((state: any) => state.chat);

  const { isLoading, data, isError, error, refetch } = useMyChatsQuery("");

  useErrors([{ isError, error }] as any);

  useEffect(() => {
    getOrSaveFromStorage({ key: NEW_MESSAGE_ALERT, value: newMessagesAlert });
  }, [newMessagesAlert]);

  const handleDeleteChat = (e: any, chatId: string, groupChat: boolean) => {
    dispatch(setIsDeleteMenu(true));
    dispatch(setSelectedDeleteChat({ chatId, groupChat }));
    deleteMenuAnchor.current = e.currentTarget;
  };

  const handleMobileClose = () => dispatch(setIsMobile(false));

  const newMessageAlertListener = useCallback(
    (data: any) => {
      if (data.chatId === chatId) return;
      dispatch(setNewMessagesAlert(data));
    },
    [chatId, dispatch]
  );

  const newRequestListener = useCallback(() => {
    dispatch(incrementNotification());
  }, [dispatch]);

  const refetchListener = useCallback(() => {
    refetch();
    navigate("/");
  }, [refetch, navigate]);

  const onlineUsersListener = useCallback((data: string[]) => {
    setOnlineUsers(data);
  }, []);

  const eventHandlers = {
    [NEW_MESSAGE_ALERT]: newMessageAlertListener,
    [NEW_REQUEST]: newRequestListener,
    [REFETCH_CHATS]: refetchListener,
    [ONLINE_USERS]: onlineUsersListener,
  };

  useSocketEvents(socket, eventHandlers);

  return (
    <>
      <Title />
      <Header />

      <DeleteChatMenu dispatch={dispatch} deleteMenuAnchor={deleteMenuAnchor} />

      {/* Mobile Drawer */}
      {isMobile && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleMobileClose}
        >
          <motion.div
            className="w-[70vw] bg-neutral-900 h-full"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ChatList
              chats={data?.data}
              chatId={chatId}
              handleDeleteChat={handleDeleteChat}
              newMessagesAlert={newMessagesAlert}
              onlineUsers={onlineUsers}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-12 h-[calc(100vh-4rem)]">
        {/* Left Sidebar */}
        <div className="hidden sm:block sm:col-span-4 md:col-span-3 h-full border-r border-neutral-500/50">
          {isLoading ? (
            <div className="animate-pulse w-full h-full bg-neutral-300 dark:bg-neutral-800" />
          ) : (
            <ChatList
              chats={data?.data}
              chatId={chatId}
              handleDeleteChat={handleDeleteChat}
              newMessagesAlert={newMessagesAlert}
              onlineUsers={onlineUsers}
            />
          )}
        </div>

        {/* Chat Content */}
        <div className="col-span-12 sm:col-span-8 md:col-span-5 lg:col-span-6 h-full">
          {WrappedComponent && (
            <WrappedComponent {...props} chatId={chatId} user={user} />
          )}
        </div>

        {/* Right Sidebar */}
        <div className="hidden md:block md:col-span-4 lg:col-span-3 h-full bg-neutral-100 dark:bg-neutral-950 p-6 border-l border-neutral-500/50">
          <Profile user={user} />
        </div>
      </div>
    </>
  );
};

export default AppLayout;
