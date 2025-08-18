import React, { Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { Search, Plus, Users, Bell, LogOut, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { userNotExists } from "../../redux/reducers/auth";
import {
  setIsMobile,
  setIsNewGroup,
  setIsNotification,
  setIsSearch,
} from "../../redux/reducers/misc";
import { resetNotificationCount } from "../../redux/reducers/chat";
import ToggleThemeBtn from "./ToggleThemeBtn";
import api from "@/utils/axiosInstace.util";

// Lazy dialogs
const SearchDialog = lazy(() => import("@/components/specific/Search.tsx"));
const NotificationDialog = lazy(
  () => import("@/components/specific/Notifications.tsx")
);
const NewGroupDialog = lazy(() => import("@/components/specific/NewGroup"));

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isSearch, isNotification, isNewGroup } = useSelector(
    (state: any) => state.misc
  );
  const { notificationCount } = useSelector((state: any) => state.chat);

  const handleMobile = () => dispatch(setIsMobile(true));
  const openSearch = () => dispatch(setIsSearch(true));
  const openNewGroup = () => dispatch(setIsNewGroup(true));
  const openNotification = () => {
    dispatch(setIsNotification(true));
    dispatch(resetNotificationCount());
  };
  const navigateToGroup = () => navigate("/groups");

  const logoutHandler = async () => {
    try {
      const { data } = await api.get(`/user/logout`);
      dispatch(userNotExists());
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      {/* AppBar */}
      <header className="w-full h-16 bg-neutral-100 dark:bg-neutral-950 shadow-md flex items-center justify-between px-4 sm:px-8">
        {/* Mobile Menu */}
        <button
          className="sm:hidden text-neutral-200 hover:text-neutral-100"
          onClick={handleMobile}
        >
          <Menu size={24} />
        </button>
        {/* Left - Brand */}
        <div className="flex items-center h-full gap-2 justify-center">
          <img
            src="/logo.png"
            alt="Logo"
            className="sm:w-8 sm:h-8 object-cover rounded-full w-4 h-4"
          />
          <h1 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 sm:flex hidden">
            HelloTalk
          </h1>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right - Action Icons */}
        <div className="flex items-center gap-3 h-full ">
          <IconBtn
            title="Search"
            icon={<Search size={20} />}
            onClick={openSearch}
          />
          <IconBtn
            title="New Group"
            icon={<Plus size={20} />}
            onClick={openNewGroup}
          />
          <IconBtn
            title="Manage Groups"
            icon={<Users size={20} />}
            onClick={navigateToGroup}
          />
          <IconBtn
            title="Notifications"
            icon={<Bell size={20} />}
            onClick={openNotification}
            value={notificationCount}
          />
          <IconBtn
            title="Logout"
            icon={<LogOut size={20} />}
            onClick={logoutHandler}
          />
          <ToggleThemeBtn className="flex " />
        </div>
      </header>

      {/* Dialogs with AnimatePresence */}
      <AnimatePresence>
        {isSearch && (
          <Suspense fallback={<Backdrop />}>
            <SearchDialog />
          </Suspense>
        )}
        {isNotification && (
          <Suspense fallback={<Backdrop />}>
            <NotificationDialog />
          </Suspense>
        )}
        {isNewGroup && (
          <Suspense fallback={<Backdrop />}>
            <NewGroupDialog />
          </Suspense>
        )}
      </AnimatePresence>
    </>
  );
};

// Reusable Icon Button with badge + hover animation
const IconBtn = ({
  title,
  icon,
  onClick,
  value,
}: {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  value?: number;
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={title}
      onClick={onClick}
      className="relative p-2 rounded-full  text-neutral-800 hover:bg-neutral-800 hover:text-neutral-100 transition dark:text-neutral-200 w-4 h-hull sm:w-auto sm:h-auto"
    >
      {icon}
      {value ? (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {value}
        </span>
      ) : null}
    </motion.button>
  );
};

// Backdrop for lazy dialogs
const Backdrop = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.5 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black z-40"
  />
);

export default Header;
