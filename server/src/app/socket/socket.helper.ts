export const getSockets = (
  users: string[] = [],
  userSocketIDs: Map<string, string>,
): string[] => {
  const sockets = users.map((user) => {
    const socketID = userSocketIDs.get(user);

    if (!socketID) return "";
    return socketID;
  });

  return sockets;
};
