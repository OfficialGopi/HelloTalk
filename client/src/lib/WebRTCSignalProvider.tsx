import { createContext, useMemo, useContext, useEffect } from "react";
import io, { Socket } from "socket.io-client";
import { WEBRTC_SIGNALLING_SERVER_URL } from "@/constants/config";

const SocketContext = createContext<Socket | null>(null);

const getWebRTCSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocket must be used within a WebRTCSignalProvider");
  }
  return socket;
};

const WebRTCSignalProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = useMemo(
    () =>
      io(WEBRTC_SIGNALLING_SERVER_URL, {
        withCredentials: true,
      }),
    []
  );

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export { WebRTCSignalProvider, getWebRTCSocket };
