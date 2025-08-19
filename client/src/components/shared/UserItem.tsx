import { memo } from "react";
import { motion } from "framer-motion";
import { UserPlus, UserMinus } from "lucide-react";
import { transformImage } from "@/utils/features";

interface UserItemProps {
  user: { _id: string; name: string; avatar?: string };
  handler: (id: string) => void;
  handlerIsLoading: boolean;
  isAdded?: boolean;
  styling?: string;
}

const UserItem = ({
  user,
  handler,
  handlerIsLoading,
  isAdded = false,
  styling = "",
}: UserItemProps) => {
  const { name, _id, avatar } = user;

  return (
    <motion.div
      layout
      className={`flex items-center justify-between gap-3 w-full p-3 rounded-xl 
        bg-neutral-100 dark:bg-neutral-900 
        hover:bg-neutral-200 dark:hover:bg-neutral-800
        transition-colors duration-200 ${styling}`}
    >
      {/* Avatar + Name */}
      <div className="flex items-center gap-3 overflow-hidden">
        <img
          src={transformImage(avatar)}
          alt={name}
          className="w-10 h-10 rounded-full object-cover ring-1 ring-neutral-300 dark:ring-neutral-700"
        />
        <p className="text-neutral-800 dark:text-neutral-200 font-medium truncate">
          {name}
        </p>
      </div>

      {/* Action Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => handler(_id)}
        disabled={handlerIsLoading}
        className={`p-2 rounded-full transition-colors flex items-center justify-center shadow-sm
          ${
            isAdded
              ? "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
              : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          } 
          disabled:opacity-50 disabled:cursor-not-allowed text-white`}
      >
        {isAdded ? <UserMinus size={18} /> : <UserPlus size={18} />}
      </motion.button>
    </motion.div>
  );
};

export default memo(UserItem);
