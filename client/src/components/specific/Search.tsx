import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search as SearchIcon } from "lucide-react";
import { useInputValidation } from "6pp";
import { useAsyncMutation } from "@/hooks/hook";
import {
  useLazySearchUserQuery,
  useSendFriendRequestMutation,
} from "@/redux/api/api";
import { setIsSearch } from "@/redux/reducers/misc";
import UserItem from "@/components/shared/UserItem";
import Modal from "@/components/ui/Modal";

interface User {
  _id: string;
  name: string;
  avatar?: string;
  [key: string]: any;
}

interface RootState {
  misc: {
    isSearch: boolean;
  };
}

const Search: React.FC = () => {
  const { isSearch } = useSelector((state: RootState) => state.misc);
  const [searchUser] = useLazySearchUserQuery();

  const [sendFriendRequest, isLoadingSendFriendRequest]: any = useAsyncMutation(
    useSendFriendRequestMutation
  );

  const dispatch = useDispatch();
  const search = useInputValidation("");
  const [users, setUsers] = useState<User[]>([]);

  const addFriendHandler = async (id: string) => {
    await sendFriendRequest?.("Sending friend request...", { userId: id });
  };

  const searchCloseHandler = () => dispatch(setIsSearch(false));

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (search.value.trim() !== "") {
        searchUser(search.value)
          .then(({ data }: any) => setUsers(data.users))
          .catch((e: unknown) => console.error(e));
      } else {
        setUsers([]);
      }
    }, 1000);

    return () => clearTimeout(timeOutId);
  }, [search.value]);

  return (
    <Modal isOpen={isSearch} onClose={searchCloseHandler}>
      <div className="flex flex-col w-full space-y-4">
        <h2 className="text-center text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Find People
        </h2>
        <div className="flex flex-1 items-center rounded-lg border border-neutral-400 dark:border-neutral-700 px-3 py-2 bg-neutral-100 dark:bg-neutral-900">
          <SearchIcon className="w-5 h-5 text-neutral-500 mr-2" />
          <input
            type="text"
            value={search.value}
            onChange={search.changeHandler}
            placeholder="Search..."
            className="flex-1 bg-transparent focus:outline-none text-neutral-900 dark:text-neutral-100"
          />
        </div>

        <div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800 max-h-64 overflow-y-auto">
          {users.map((i) => (
            <UserItem
              user={i}
              key={i._id}
              handler={addFriendHandler}
              handlerIsLoading={isLoadingSendFriendRequest}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default Search;
