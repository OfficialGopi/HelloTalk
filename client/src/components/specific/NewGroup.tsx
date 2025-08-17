import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useInputValidation } from "6pp";
import {
  useAvailableFriendsQuery,
  useNewGroupMutation,
} from "../../redux/api/api";
import { useAsyncMutation, useErrors } from "../../hooks/hook";
import { setIsNewGroup } from "../../redux/reducers/misc";
import { toast } from "sonner";
import UserItem from "../shared/UserItem";

const NewGroup = () => {
  const { isNewGroup } = useSelector((state: any) => state.misc);
  const dispatch = useDispatch();

  const { isError, isLoading, error, data } = useAvailableFriendsQuery("", {
    skip: !isNewGroup,
  });
  const [newGroup, isLoadingNewGroup]: any =
    useAsyncMutation(useNewGroupMutation);

  const groupName = useInputValidation("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const errors = [{ isError, error }];
  useErrors(errors as any);

  const selectMemberHandler = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((curr) => curr !== id) : [...prev, id]
    );
  };

  const submitHandler = () => {
    if (!groupName.value) return toast.error("Group name is required");

    if (selectedMembers.length < 2)
      return toast.error("Please Select Atleast 3 Members");

    newGroup("Creating New Group...", {
      name: groupName.value,
      members: selectedMembers,
    });

    closeHandler();
  };

  const closeHandler = () => {
    dispatch(setIsNewGroup(false));
  };

  return (
    <AnimatePresence>
      {isNewGroup && (
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
            className="bg-neutral-900 text-neutral-100 rounded-lg shadow-xl w-[90%] max-w-md p-6 space-y-6"
          >
            <h2 className="text-2xl font-semibold text-center">New Group</h2>

            {/* Group Name Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-neutral-300">Group Name</label>
              <input
                type="text"
                value={groupName.value}
                onChange={groupName.changeHandler}
                placeholder="Enter group name..."
                className="w-full px-3 py-2 rounded-md bg-neutral-800 text-neutral-100 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500"
              />
            </div>

            {/* Members */}
            <div>
              <p className="mb-2 text-neutral-300">Members</p>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {isLoading ? (
                  <>
                    <div className="h-10 bg-neutral-800 animate-pulse rounded-md" />
                    <div className="h-10 bg-neutral-800 animate-pulse rounded-md" />
                  </>
                ) : (
                  data?.friends?.map((i: any) => (
                    <UserItem
                      user={i}
                      key={i._id}
                      handlerIsLoading={false} //fIX THE BUG
                      handler={selectMemberHandler}
                      isAdded={selectedMembers.includes(i._id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-evenly pt-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={closeHandler}
                className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white"
              >
                Cancel
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={submitHandler}
                disabled={isLoadingNewGroup}
                className="px-4 py-2 rounded-md text-sm font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-900 disabled:opacity-50"
              >
                Create
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewGroup;
