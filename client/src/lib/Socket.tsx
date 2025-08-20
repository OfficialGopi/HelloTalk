import { createContext, useMemo, useContext } from "react";
import io, { Socket } from "socket.io-client";
import { SERVER_URL } from "@/constants/config";

const SocketContext = createContext<Socket | null>(null);

const getSocket = () => useContext(SocketContext);

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = useMemo(() => io(SERVER_URL, { withCredentials: true }), []);

  console.log(socket);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export { SocketProvider, getSocket };
