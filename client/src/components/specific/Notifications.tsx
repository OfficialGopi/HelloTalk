import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useAsyncMutation, useErrors } from "../../hooks/hook";
import {
  useAcceptFriendRequestMutation,
  useGetNotificationsQuery,
} from "../../redux/api/api";
import { setIsNotification } from "../../redux/reducers/misc";
import { UserCheck, UserX } from "lucide-react";
import { transformImage } from "@/utils/features";

const Notifications = () => {
  const { isNotification } = useSelector((state: any) => state.misc);
  const dispatch = useDispatch();

  //Need to fix this [
  const { isLoading, data, error, isError } = useGetNotificationsQuery("", {
    skip: !isNotification,
  });
  //  ] Till here
  const [acceptRequest]: any = useAsyncMutation(useAcceptFriendRequestMutation);

  const friendRequestHandler = async ({
    _id,
    accept,
  }: {
    _id: string;
    accept: boolean;
  }) => {
    dispatch(setIsNotification(false));
    await acceptRequest("Accepting...", { requestId: _id, accept });
  };

  const closeHandler = () => dispatch(setIsNotification(false));

  useErrors([{ error, isError }] as any);

  return (
    <AnimatePresence>
      {isNotification && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: "blur(6px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.95, filter: "blur(6px)" }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={closeHandler}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-neutral-900 text-neutral-100 rounded-lg shadow-xl w-[90%] max-w-md p-6"
          >
            <h2 className="text-xl font-semibold mb-4 text-center">
              Notifications
            </h2>

            {isLoading ? (
              <div className="space-y-2">
                <div className="h-12 bg-neutral-800 animate-pulse rounded-md" />
                <div className="h-12 bg-neutral-800 animate-pulse rounded-md" />
              </div>
            ) : data?.data?.length > 0 ? (
              <div className="space-y-3">
                {data.data.map(({ sender, _id }: any) => (
                  <NotificationItem
                    key={_id}
                    sender={sender}
                    _id={_id}
                    handler={friendRequestHandler}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-neutral-400">0 notifications</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const NotificationItem = memo(
  ({
    sender,
    _id,
    handler,
  }: {
    sender: { name: string; avatar?: string };
    _id: string;
    handler: ({ _id, accept }: { _id: string; accept: boolean }) => void;
  }) => {
    const { name, avatar } = sender;

    return (
      <motion.div
        layout
        className="flex items-center justify-between gap-3 p-3 rounded-md bg-neutral-800 hover:bg-neutral-700 transition"
      >
        {/* Avatar + Text */}
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src={transformImage(avatar)}
            alt={name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <p className="truncate text-neutral-200">
            {name} sent you a friend request.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handler({ _id, accept: true })}
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm"
          >
            <UserCheck size={16} /> Accept
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handler({ _id, accept: false })}
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm"
          >
            <UserX size={16} /> Reject
          </motion.button>
        </div>
      </motion.div>
    );
  }
);

export default Notifications;
