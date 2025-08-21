import { useFetchData } from "6pp";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AdminLayout from "../../components/layout/AdminLayout";
import AvatarCard from "../../components/shared/AvatarCard";
import Table from "../../components/shared/Table";
import { SERVER_API_URL } from "../../constants/config";
import { useErrors } from "../../hooks/hook";
import { transformImage } from "@/utils/features";

const columns = [
  {
    field: "id",
    headerName: "ID",
    width: 200,
  },
  {
    field: "avatar",
    headerName: "Avatar",
    width: 150,
    renderCell: (params: any) => <AvatarCard avatar={params.row.avatar} />,
  },
  {
    field: "name",
    headerName: "Name",
    width: 300,
  },
  {
    field: "groupChat",
    headerName: "Group",
    width: 100,
  },
  {
    field: "totalMembers",
    headerName: "Total Members",
    width: 120,
  },
  {
    field: "members",
    headerName: "Members",
    width: 400,
    renderCell: (params: any) => (
      <AvatarCard max={100} avatar={params.row.members} />
    ),
  },
  {
    field: "totalMessages",
    headerName: "Total Messages",
    width: 120,
  },
  {
    field: "creator",
    headerName: "Created By",
    width: 250,
    renderCell: (params: any) => (
      <div className="flex items-center gap-3">
        <img
          src={params.row.creator.avatar}
          alt={params.row.creator.name}
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-neutral-800 dark:text-neutral-200">
          {params.row.creator.name}
        </span>
      </div>
    ),
  },
];

const ChatManagement = () => {
  const {
    loading,
    data,
    error,
  }: {
    loading: boolean;
    data: any;
    error: any;
  } = useFetchData({
    url: `${SERVER_API_URL}/admin/chats`,
    key: "dashboard-chats",
    dependencyProps: [],
    credentials: "include",
  });

  useErrors([{ isError: error, error }] as any);

  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (data) {
      setRows(
        data.data?.map((i: any) => ({
          ...i,
          id: i._id,
          avatar: i.avatar.map((a: any) => transformImage(a, 50)),
          members: i.members.map((m: any) => transformImage(m.avatar, 50)),
          creator: {
            name: i.creator.name,
            avatar: transformImage(i.creator.avatar, 50),
          },
        }))
      );
    }
  }, [data]);

  return (
    <AdminLayout>
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full h-screen flex items-center justify-center"
        >
          <div className="w-16 h-16 border-4 border-neutral-400 dark:border-neutral-600 border-t-transparent rounded-full animate-spin" />
        </motion.div>
      ) : (
        <Table heading="All Chats" columns={columns} rows={rows} />
      )}
    </AdminLayout>
  );
};

export default ChatManagement;
