import { Suspense, lazy, memo, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Menu, Edit, Check, Trash2, UserPlus } from "lucide-react";

import { LayoutLoader } from "@/components/loaders/Loaders";
import AvatarCard from "../components/shared/AvatarCard";
import { useAsyncMutation, useErrors } from "../hooks/hook";
import {
  useChatDetailsQuery,
  useDeleteChatMutation,
  useMyGroupsQuery,
  useRemoveGroupMemberMutation,
  useRenameGroupMutation,
} from "@/redux/api/api";
import { setIsAddMember } from "@/redux/reducers/misc";
import UserItem from "@/components/shared/UserItem";

const ConfirmDeleteDialog = lazy(
  () => import("@/components/dialogs/ConfirmDeleteDialog")
);
const AddMemberDialog = lazy(
  () => import("@/components/dialogs/AddMemberDialog")
);

const Groups = () => {
  const chatId = useSearchParams()[0].get("group");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAddMember } = useSelector(
    (state: {
      misc: {
        isAddMember: boolean;
      };
    }) => state.misc
  );

  const myGroups = useMyGroupsQuery("");

  const groupDetails: any = useChatDetailsQuery(
    { chatId, populate: true },
    { skip: !chatId }
  );

  const [updateGroup, isLoadingGroupName]: any = useAsyncMutation(
    useRenameGroupMutation
  );
  const [removeMember, isLoadingRemoveMember]: any = useAsyncMutation(
    useRemoveGroupMemberMutation
  );
  const [deleteGroup, isLoadingDeleteGroup]: any = useAsyncMutation(
    useDeleteChatMutation
  );

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);

  const [groupName, setGroupName] = useState("");
  const [groupNameUpdatedValue, setGroupNameUpdatedValue] = useState("");
  const [members, setMembers] = useState([]);

  const errors = [
    { isError: myGroups.isError, error: myGroups.error },
    { isError: groupDetails.isError, error: groupDetails.error },
  ];
  useErrors(errors as any);

  useEffect(() => {
    const groupData = groupDetails.data;
    if (groupData) {
      setGroupName(groupData.data.name);
      setGroupNameUpdatedValue(groupData.data.name);
      setMembers(groupData.data.members);
    }
    return () => {
      setGroupName("");
      setGroupNameUpdatedValue("");
      setMembers([]);
      setIsEdit(false);
    };
  }, [groupDetails.data]);

  const navigateBack = () => navigate("/");
  const handleMobile = () => setIsMobileMenuOpen((prev) => !prev);
  const handleMobileClose = () => setIsMobileMenuOpen(false);

  const updateGroupName = () => {
    setIsEdit(false);
    updateGroup("Updating Group Name...", {
      chatId,
      name: groupNameUpdatedValue,
    });
  };

  const deleteHandler = () => {
    deleteGroup("Deleting Group...", chatId);
    setConfirmDeleteDialog(false);
    navigate("/groups");
  };

  const removeMemberHandler = (userId: string) => {
    removeMember("Removing Member...", { chatId, userId });
  };

  // Floating Mobile Menu Button
  const IconBtns = (
    <>
      <div className="block sm:hidden fixed right-4 top-4 z-50">
        <button
          onClick={handleMobile}
          className="p-2 rounded-full bg-neutral-800 text-neutral-100 hover:bg-neutral-700"
        >
          <Menu size={20} />
        </button>
      </div>

      <button
        onClick={navigateBack}
        className="absolute top-8 left-8 p-2 rounded-full bg-neutral-800 text-white hover:bg-neutral-700"
      >
        <ArrowLeft size={20} />
      </button>
    </>
  );

  const GroupName = (
    <div className="flex flex-row items-center justify-center gap-4 py-12">
      {isEdit ? (
        <>
          <input
            value={groupNameUpdatedValue}
            onChange={(e) => setGroupNameUpdatedValue(e.target.value)}
            className="px-3 py-2 rounded-md border border-neutral-400 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
          />
          <button
            onClick={updateGroupName}
            disabled={isLoadingGroupName}
            className="p-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            <Check size={20} />
          </button>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {groupName}
          </h2>
          <button
            disabled={isLoadingGroupName}
            onClick={() => setIsEdit(true)}
            className="p-2 rounded-md bg-neutral-700 text-white hover:bg-neutral-600"
          >
            <Edit size={20} />
          </button>
        </>
      )}
    </div>
  );

  const ButtonGroup = (
    <div className="flex flex-col sm:flex-row gap-4 p-4 md:px-16">
      <button
        onClick={() => setConfirmDeleteDialog(true)}
        className="flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
      >
        <Trash2 size={18} /> Delete Group
      </button>
      <button
        onClick={() => dispatch(setIsAddMember(true))}
        className="flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
      >
        <UserPlus size={18} /> Add Member
      </button>
    </div>
  );

  return myGroups.isLoading ? (
    <LayoutLoader />
  ) : (
    <div className="grid grid-cols-12 h-screen bg-neutral-100 dark:bg-neutral-950">
      {/* Sidebar */}
      <div className="hidden sm:block sm:col-span-4">
        <GroupsList myGroups={myGroups?.data?.data} chatId={chatId} />
      </div>

      {/* Main Content */}
      <div className="col-span-12 sm:col-span-8 flex flex-col items-center relative p-4 sm:p-8">
        {IconBtns}

        {groupName && (
          <>
            {GroupName}

            <p className="mt-8 self-start text-neutral-700 dark:text-neutral-300 font-medium">
              Members
            </p>

            <div className="w-full max-w-3xl h-1/2 overflow-y-auto space-y-4 p-4">
              {isLoadingRemoveMember ? (
                <div className="flex justify-center py-10">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                    className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                  />
                </div>
              ) : (
                members.map((i, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="shadow-md rounded-xl p-4 bg-neutral-50 dark:bg-neutral-900"
                  >
                    <UserItem
                      handlerIsLoading={isLoadingRemoveMember}
                      user={i}
                      isAdded
                      handler={removeMemberHandler}
                    />
                  </motion.div>
                ))
              )}
            </div>

            {ButtonGroup}
          </>
        )}
      </div>

      {/* Add Member Dialog */}
      <AnimatePresence>
        {isAddMember && (
          <Suspense
            fallback={
              <div className="fixed inset-0 flex items-center justify-center bg-black/50">
                Loading...
              </div>
            }
          >
            <AddMemberDialog chatId={chatId!} />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Confirm Delete Dialog */}
      <AnimatePresence>
        {confirmDeleteDialog && (
          <Suspense
            fallback={
              <div className="fixed inset-0 flex items-center justify-center bg-black/50">
                Loading...
              </div>
            }
          >
            <ConfirmDeleteDialog
              open={confirmDeleteDialog}
              handleClose={() => setConfirmDeleteDialog(false)}
              deleteHandler={deleteHandler}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 left-0 w-2/3 bg-neutral-100 dark:bg-neutral-950 shadow-xl z-50"
          >
            <GroupsList myGroups={myGroups?.data?.groups} chatId={chatId} />
            <button
              onClick={handleMobileClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-white hover:bg-neutral-700"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GroupsList = ({ w = "100%", myGroups = [], chatId }: any) => (
  <div className="w-full h-full overflow-y-auto bg-gradient-to-b from-neutral-200 to-neutral-300 dark:from-neutral-900 dark:to-neutral-800">
    {myGroups.length > 0 ? (
      myGroups.map((group: any) => (
        <GroupListItem group={group} chatId={chatId} key={group._id} />
      ))
    ) : (
      <p className="text-center py-4 text-neutral-600 dark:text-neutral-400">
        No groups
      </p>
    )}
  </div>
);

const GroupListItem = memo(
  ({ group, chatId }: { group: any; chatId: string }) => {
    const { name, avatar, _id } = group;

    return (
      <Link
        to={`?group=${_id}`}
        onClick={(e) => {
          if (chatId === _id) e.preventDefault();
        }}
        className="flex items-center gap-4 p-4 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition rounded-lg"
      >
        <AvatarCard avatar={avatar} />
        <span className="text-neutral-900 dark:text-neutral-100">{name}</span>
      </Link>
    );
  }
);

export default Groups;
