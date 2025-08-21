import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  useAddGroupMembersMutation,
  useAvailableFriendsQuery,
} from "@/redux/api/api";
import { useAsyncMutation, useErrors } from "@/hooks/hook";
import { setIsAddMember } from "@/redux/reducers/misc";
import UserItem from "@/components/shared/UserItem";

const AddMemberDialog = ({ chatId }: { chatId: string }) => {
  const dispatch = useDispatch();
  const { isAddMember } = useSelector(
    (state: {
      misc: {
        isAddMember: boolean;
      };
    }) => state.misc
  );

  const { isLoading, data, isError, error } = useAvailableFriendsQuery(chatId);

  const [addMembers, isLoadingAddMembers]: any = useAsyncMutation(
    useAddGroupMembersMutation
  );

  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const selectMemberHandler = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((curr) => curr !== id) : [...prev, id]
    );
  };

  const closeHandler = () => {
    dispatch(setIsAddMember(false));
  };

  const addMemberSubmitHandler = () => {
    addMembers("Adding Members...", { members: selectedMembers, chatId });
    closeHandler();
  };

  useErrors([{ isError, error }] as any);

  return (
    <AnimatePresence>
      {isAddMember && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-2xl bg-neutral-100 dark:bg-neutral-950 p-6 shadow-xl"
          >
            {/* Title */}
            <h2 className="text-lg font-semibold text-center text-neutral-900 dark:text-neutral-100">
              Add Member
            </h2>

            {/* List of Friends */}
            <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="animate-pulse text-center text-neutral-500">
                  Loading...
                </div>
              ) : data?.data?.length > 0 ? (
                data.data.map((i: any) => (
                  <UserItem
                    key={i._id}
                    user={i}
                    handler={selectMemberHandler}
                    isAdded={selectedMembers.includes(i._id)}
                    handlerIsLoading={isLoadingAddMembers}
                  />
                ))
              ) : (
                <p className="text-center text-neutral-500 dark:text-neutral-400">
                  No Friends
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeHandler}
                className="px-4 py-2 rounded-lg bg-neutral-300 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-400 dark:hover:bg-neutral-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={addMemberSubmitHandler}
                disabled={isLoadingAddMembers}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
              >
                Submit Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddMemberDialog;
