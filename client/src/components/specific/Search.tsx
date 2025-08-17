import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useInputValidation } from "6pp";
import { useAsyncMutation } from "@/hooks/hook";
import {
  useLazySearchUserQuery,
  useSendFriendRequestMutation,
} from "../../redux/api/api";
import { setIsSearch } from "../../redux/reducers/misc";
import UserItem from "../shared/UserItem";

const SearchDialog = () => {
  const { isSearch } = useSelector(
    (state: { misc: { isSearch: boolean } }) => state.misc
  );

  const [searchUser] = useLazySearchUserQuery();
  const [sendFriendRequest, isLoadingSendFriendRequest]: any = useAsyncMutation(
    useSendFriendRequestMutation
  );

  const dispatch = useDispatch();
  const search = useInputValidation("");
  const [users, setUsers] = useState([]);

  const addFriendHandler = async (id: string) => {
    await sendFriendRequest("Sending friend request...", { userId: id });
  };

  const searchCloseHandler = () => dispatch(setIsSearch(false));

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (search.value.trim() !== "") {
        searchUser(search.value)
          .then(({ data }: any) => setUsers(data.users))
          .catch((e: any) => console.log(e));
      } else {
        setUsers([]);
      }
    }, 500);

    return () => clearTimeout(timeOutId);
  }, [search.value]);

  return (
    <AnimatePresence>
      {isSearch && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={searchCloseHandler}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Dialog */}
          <motion.div
            className="fixed z-50 top-1/2 left-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 
              bg-neutral-900 border border-neutral-700 rounded-xl shadow-lg p-6"
            initial={{ scale: 0.8, opacity: 0, filter: "blur(6px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 0.8, opacity: 0, filter: "blur(6px)" }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
          >
            {/* Title */}
            <h2 className="text-center text-lg font-semibold text-neutral-100 mb-4">
              Find People
            </h2>

            {/* Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                value={search.value}
                onChange={search.changeHandler}
                placeholder="Search users..."
                className="w-full pl-10 pr-3 py-2 rounded-md bg-neutral-800 
                  text-neutral-100 placeholder-neutral-500 focus:outline-none 
                  focus:ring-2 focus:ring-neutral-600"
              />
            </div>

            {/* Results */}
            <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
              {users.length > 0 ? (
                users.map((i: any) => (
                  <UserItem
                    user={i}
                    key={i._id}
                    handler={addFriendHandler}
                    handlerIsLoading={isLoadingSendFriendRequest}
                  />
                ))
              ) : (
                <p className="text-neutral-500 text-sm text-center mt-6">
                  {search.value
                    ? "No users found"
                    : "Start typing to search..."}
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchDialog;
