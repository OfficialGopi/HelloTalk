import { useFetchData } from "6pp";
import {
  ShieldCheck,
  Users,
  MessageSquare,
  Bell,
  User,
  type LucideProps,
} from "lucide-react";
import moment from "moment";
import AdminLayout from "@/components/layout/AdminLayout";
import { DoughnutChart, LineChart } from "@/components/specific/Charts";
import { SERVER_API_URL } from "@/constants/config";
import { useErrors } from "../../hooks/hook";
import { motion } from "framer-motion";

const Dashboard = () => {
  const {
    loading,
    data,
    error,
  }: {
    loading: boolean;
    data: any;
    error: any;
  } = useFetchData({
    url: `${SERVER_API_URL}/admin/stats`,
    credentials: "include",
    dependencyProps: [],
  });

  const stats = data?.data;
  useErrors([{ isError: error, error }] as any);

  return (
    <AdminLayout>
      {loading ? (
        <div className="w-full h-screen animate-pulse bg-neutral-900 rounded-lg" />
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Top Appbar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-neutral-900 rounded-2xl p-6 flex items-center gap-4 shadow-md"
          >
            <ShieldCheck className="w-10 h-10 text-neutral-300" />

            <input
              placeholder="Search..."
              className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-200 focus:outline-none flex-1"
            />
            <button className="px-4 py-2 bg-neutral-700 rounded-xl hover:bg-neutral-600 transition">
              Search
            </button>

            <div className="hidden lg:block text-neutral-400 text-sm">
              {moment().format("dddd, D MMMM YYYY")}
            </div>

            <Bell className="w-6 h-6 text-neutral-300" />
          </motion.div>

          {/* Charts Section */}
          <div className="flex flex-col lg:flex-row gap-6 justify-center items-stretch">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-neutral-900 rounded-2xl p-6 w-full max-w-3xl shadow-lg"
            >
              <h2 className="text-xl font-semibold text-neutral-200 mb-4">
                Last Messages
              </h2>
              <LineChart value={stats?.messagesChart || []} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-neutral-900 rounded-2xl p-6 flex justify-center items-center relative w-full max-w-sm shadow-lg"
            >
              <DoughnutChart
                labels={["Single Chats", "Group Chats"] as any}
                value={
                  [
                    stats?.totalChatsCount - stats?.groupsCount || 0,
                    stats?.groupsCount || 0,
                  ] as any
                }
              />
              <div className="absolute flex items-center gap-2 text-neutral-300">
                <Users className="w-5 h-5" /> <span>vs</span>{" "}
                <User className="w-5 h-5" />
              </div>
            </motion.div>
          </div>

          {/* Widgets Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <Widget title="Users" value={stats?.usersCount} Icon={Users} />
            <Widget
              title="Chats"
              value={stats?.totalChatsCount}
              Icon={MessageSquare}
            />
            <Widget
              title="Messages"
              value={stats?.messagesCount}
              Icon={MessageSquare}
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

const Widget = ({
  title,
  value,
  Icon,
}: {
  title: string;
  value: number;
  Icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-neutral-900 rounded-2xl p-6 w-72 text-center shadow-md"
  >
    <div className="text-3xl font-bold text-neutral-100 border-4 border-neutral-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
      {value}
    </div>
    <div className="flex items-center justify-center gap-2 text-neutral-300">
      <Icon className="w-5 h-5" /> {title}
    </div>
  </motion.div>
);

export default Dashboard;
