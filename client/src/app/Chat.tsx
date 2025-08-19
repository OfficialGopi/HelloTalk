import React, { useCallback, useEffect, useRef, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Paperclip, Send } from "lucide-react";
import FileMenu from "../components/dialogs/FileMenu";
import MessageComponent from "../components/shared/MessageComponent";
import { getSocket } from "@/lib/Socket";
import { events } from "../constants/events";

import { useChatDetailsQuery, useGetMessagesQuery } from "@/redux/api/api";
import { useErrors, useSocketEvents } from "@/hooks/hook";
import { useInfiniteScrollTop } from "6pp";
import { useDispatch } from "react-redux";
import { setIsFileMenu } from "../redux/reducers/misc";
import { removeNewMessagesAlert } from "../redux/reducers/chat";
import { TypingLoader } from "@/components/loaders/Loaders";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AutoResizeTextarea from "@/components/ui/AutoResizeTextArea";

const {
  ALERT,
  CHAT_JOINED,
  CHAT_LEAVED,
  NEW_MESSAGE,
  START_TYPING,
  STOP_TYPING,
} = events;

const Chat = ({ chatId, user }: { chatId: string; user: any }) => {
  const socket = getSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [fileMenuAnchor, setFileMenuAnchor] = useState<any>(null);

  const [IamTyping, setIamTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const typingTimeout = useRef<any>(null);

  const chatDetails = useChatDetailsQuery({ chatId, skip: !chatId });
  const oldMessagesChunk = useGetMessagesQuery({ chatId, page });

  const { data: oldMessages, setData: setOldMessages } = useInfiniteScrollTop(
    containerRef,
    oldMessagesChunk.data?.totalPages,
    page,
    setPage,
    oldMessagesChunk.data?.messages
  );

  const errors = [
    { isError: chatDetails.isError, error: chatDetails.error },
    { isError: oldMessagesChunk.isError, error: oldMessagesChunk.error },
  ];

  const members = chatDetails?.data?.chat?.members;

  const messageOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    if (!IamTyping) {
      socket?.emit(START_TYPING, { members, chatId });
      setIamTyping(true);
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket?.emit(STOP_TYPING, { members, chatId });
      setIamTyping(false);
    }, 2000);
  };

  const handleFileOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    dispatch(setIsFileMenu(true));
    setFileMenuAnchor(e.currentTarget);
  };

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    socket?.emit(NEW_MESSAGE, { chatId, members, message });
    setMessage("");
  };

  useEffect(() => {
    socket?.emit(CHAT_JOINED, { userId: user._id, members });
    dispatch(removeNewMessagesAlert(chatId));

    return () => {
      setMessages([]);
      setMessage("");
      setOldMessages([]);
      setPage(1);
      socket?.emit(CHAT_LEAVED, { userId: user._id, members });
    };
  }, [chatId]);

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chatDetails.isError) navigate("/");
  }, [chatDetails.isError]);

  const newMessagesListener = useCallback(
    (data: any) => {
      if (data.chatId !== chatId) return;
      setMessages((prev) => [...prev, data.message]);
    },
    [chatId]
  );

  const startTypingListener = useCallback(
    (data: any) => {
      if (data.chatId !== chatId) return;
      setUserTyping(true);
    },
    [chatId]
  );

  const stopTypingListener = useCallback(
    (data: any) => {
      if (data.chatId !== chatId) return;
      setUserTyping(false);
    },
    [chatId]
  );

  const alertListener = useCallback(
    (data: any) => {
      if (data.chatId !== chatId) return;
      const messageForAlert = {
        content: data.message,
        sender: {
          _id: "system-alert",
          name: "Admin",
        },
        chat: chatId,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, messageForAlert]);
    },
    [chatId]
  );

  const eventHandler = {
    [ALERT]: alertListener,
    [NEW_MESSAGE]: newMessagesListener,
    [START_TYPING]: startTypingListener,
    [STOP_TYPING]: stopTypingListener,
  };

  useSocketEvents(socket, eventHandler);
  useErrors(errors as any);

  const allMessages = [...oldMessages, ...messages];

  return chatDetails.isLoading ? (
    <div className="p-4 text-neutral-500">Loading chat...</div>
  ) : (
    <div className="flex w-full flex-col h-full ">
      {/* Messages container */}
      <div
        ref={containerRef}
        className="flex flex-col p-4 gap-4 bg-neutral-50 dark:bg-neutral-900 flex-1  overflow-y-auto overflow-x-hidden"
      >
        {allMessages.map((i) => (
          <MessageComponent key={i._id} message={i} user={user} />
        ))}

        {userTyping && <TypingLoader />}
        <div ref={bottomRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={submitHandler}
        className="min-h-[10%] max-h-[20%] relative border-t border-neutral-500/50 bg-neutral-100 dark:bg-neutral-900   overflow-y-auto overflow-x-hidden"
      >
        <div className="flex items-center h-full p-4 relative">
          <div className="text-neutral-600 w-full dark:text-neutral-300 flex items-center gap-2 border border-neutral-500/50 rounded-lg p-2 focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 ">
            <motion.button
              type="button"
              whileTap={{ scale: 0.8, rotate: 45 }}
              className="  text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-white"
              onClick={handleFileOpen}
            >
              <Paperclip />
            </motion.button>

            <AutoResizeTextarea
              onChange={messageOnChange}
              value={message}
              className="relative bottom-0"
            />
          </div>

          <button
            type="submit"
            className="ml-4 p-2 rounded-full border border-neutral-500/50 text-neutral-800 hover:bg-neutral-800 hover:text-neutral-100 transition dark:text-neutral-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

      <FileMenu anchorE1={fileMenuAnchor} chatId={chatId} />
    </div>
  );
};

export default AppLayout()(Chat);
