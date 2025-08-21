import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectRoute from "@/utils/ProtectedRoute";
import { LayoutLoader } from "@/components/loaders/Loaders";
import { useDispatch, useSelector } from "react-redux";
import { userExists, userNotExists } from "@/redux/reducers/auth";
import { Toaster } from "sonner";
import { SocketProvider } from "@/lib/Socket";
import api from "@/utils/axiosInstace.util";

const Home = lazy(() => import("@/app/Home"));
const Authenticate = lazy(() => import("@/app/Authenticate"));
const Chat = lazy(() => import("@/app/Chat"));
const Groups = lazy(() => import("@/app/Groups"));
const NotFound = lazy(() => import("@/app/NotFound"));

const AdminLogin = lazy(() => import("@/app/(admin)/AdminLogin"));
const Dashboard = lazy(() => import("@/app/(admin)/Dashboard"));
const UserManagement = lazy(() => import("@/app/(admin)/UserManagement"));
const ChatManagement = lazy(() => import("@/app/(admin)/ChatManagement"));
const MessagesManagement = lazy(
  () => import("@/app/(admin)/MessageManagement")
);

const App = () => {
  const { user, loader } = useSelector((state: { auth: any }) => state.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    api
      .get(`/user/me`)
      .then(({ data }) => dispatch(userExists(data.data)))
      .catch(() => dispatch(userNotExists()));
  }, [dispatch]);

  return loader ? (
    <LayoutLoader />
  ) : (
    <BrowserRouter>
      <Suspense fallback={<LayoutLoader />}>
        <Routes>
          <Route
            element={
              <SocketProvider>
                <ProtectRoute user={user} />
              </SocketProvider>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/chat/:chatId" element={<Chat />} />
            <Route path="/groups" element={<Groups />} />
          </Route>

          <Route
            path="/authenticate"
            element={
              <ProtectRoute user={!user} redirect="/">
                <Authenticate />
              </ProtectRoute>
            }
          />

          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/chats" element={<ChatManagement />} />
          <Route path="/admin/messages" element={<MessagesManagement />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <Toaster position="bottom-center" />
    </BrowserRouter>
  );
};

export default App;
