import { useState } from "react";
import { Link as RouterLink, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminLogout } from "@/redux/thunks/admin";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  LogOut,
  Menu,
  X,
  MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const adminTabs = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    name: "Users",
    path: "/admin/users",
    icon: <Users size={20} />,
  },
  {
    name: "Chats",
    path: "/admin/chats",
    icon: <MessageSquare size={20} />,
  },
  {
    name: "Messages",
    path: "/admin/messages",
    icon: <MessageCircle size={20} />,
  },
];

const Sidebar = ({
  w = "100%",
  onNavigate,
}: {
  w?: string;
  onNavigate?: () => void;
}) => {
  const location = useLocation();
  const dispatch = useDispatch();

  const logoutHandler = () => {
    dispatch(adminLogout() as any);
    if (onNavigate) onNavigate();
  };

  return (
    <div className={`w-[${w}] flex flex-col p-8 space-y-6`}>
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="logo" className="w-10 h-10 rounded-lg" />
        <h2 className="text-xl font-bold uppercase tracking-wide text-neutral-900 dark:text-neutral-100">
          HELLOTALK
        </h2>
      </div>

      <div className="flex flex-col space-y-3">
        {adminTabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <RouterLink
              key={tab.path}
              to={tab.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition-colors 
                ${
                  isActive
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-800 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white"
                }`}
            >
              {tab.icon}
              <span className="text-sm font-medium">{tab.name}</span>
            </RouterLink>
          );
        })}

        <button
          onClick={logoutHandler}
          className="flex items-center gap-3 px-4 py-2 rounded-2xl text-neutral-800 dark:text-neutral-300 hover:text-red-500 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin } = useSelector(
    (state: {
      auth: {
        isAdmin: boolean;
      };
    }) => state.auth
  );
  const [isMobile, setIsMobile] = useState(false);

  const toggleMobile = () => setIsMobile((prev) => !prev);
  const handleClose = () => setIsMobile(false);

  if (!isAdmin) return <Navigate to="/admin" />;

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-12">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={toggleMobile}
          className="p-2 rounded-lg bg-neutral-200 dark:bg-neutral-800"
        >
          {isMobile ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden md:block md:col-span-4 lg:col-span-3 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="col-span-12 md:col-span-8 lg:col-span-9 bg-neutral-100 dark:bg-neutral-950">
        {children}
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobile && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={handleClose}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3 }}
              className="absolute right-0 top-0 h-full w-3/4 sm:w-1/2 bg-neutral-100 dark:bg-neutral-950 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar onNavigate={handleClose} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;
