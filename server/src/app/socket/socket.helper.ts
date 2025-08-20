import { userSocketIDs } from "./index";

export const getSockets = (users: string[] = []): string[] => {
  const sockets = users.map((user) => {
    const socketID = userSocketIDs.get(user.toString());

    if (!socketID) return "";
    return socketID;
  });

  return sockets;
};
