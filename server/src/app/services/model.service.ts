import { IUser } from "../types/schemas.types";

const sanitizeUser = (user: Partial<IUser>) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    username: user.username,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export { sanitizeUser };
