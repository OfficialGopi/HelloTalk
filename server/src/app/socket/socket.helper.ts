import { userSocketIDs } from ".";

export const getSockets = (users: string[] = []): string[] => {
  const sockets = users.map((user) => {
    const socketID = userSocketIDs.get(user);

    if (!socketID) return "";
    return socketID;
  });

  return sockets;
};
