import { createContext, useMemo, useContext, useEffect } from "react";
import io, { Socket } from "socket.io-client";
import { SERVER_URL } from "@/constants/config";

const SocketContext = createContext<Socket | null>(null);

const getSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return socket;
};

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = useMemo(() => io(SERVER_URL, { withCredentials: true }), []);

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export { SocketProvider, getSocket };
