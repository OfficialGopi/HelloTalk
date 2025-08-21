import { useEffect, useState } from "react";
import { useFetchData } from "6pp";
import AdminLayout from "@/components/layout/AdminLayout";
import Table from "@/components/shared/Table";
import { SERVER_API_URL } from "../../constants/config";
import { useErrors } from "../../hooks/hook";
import { transformImage } from "@/utils/features";
import { motion } from "framer-motion";

const columns = [
  {
    field: "id",
    headerName: "ID",
    headerClassName: "table-header",
    width: 200,
  },
  {
    field: "avatar",
    headerName: "Avatar",
    headerClassName: "table-header",
    width: 150,
    renderCell: (params: { row: any }) => (
      <div className="flex items-center justify-center">
        {params.row.avatar ? (
          <img
            src={params.row.avatar}
            alt={params.row.name}
            className="w-10 h-10 rounded-full object-cover shadow-md"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-neutral-400 dark:bg-neutral-700 animate-pulse" />
        )}
      </div>
    ),
  },
  {
    field: "name",
    headerName: "Name",
    headerClassName: "table-header",
    width: 200,
  },
  {
    field: "username",
    headerName: "Username",
    headerClassName: "table-header",
    width: 200,
  },
  {
    field: "friends",
    headerName: "Friends",
    headerClassName: "table-header",
    width: 150,
  },
  {
    field: "groups",
    headerName: "Groups",
    headerClassName: "table-header",
    width: 200,
  },
];

const UserManagement = () => {
  const {
    loading,
    data,
    error,
  }: {
    loading: boolean;
    data: any;
    error: any;
  } = useFetchData({
    url: `${SERVER_API_URL}/admin/users`,
    key: "dashboard-users",
    dependencyProps: [],
    credentials: "include",
  });

  useErrors([
    {
      isError: error,
      error: error,
    },
  ] as any);

  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (data) {
      setRows(
        (data?.data as any).map((i: any) => ({
          ...i,
          id: i._id,
          avatar: transformImage(i.avatar, 50),
        }))
      );
    }
  }, [data]);

  return (
    <AdminLayout>
      {loading ? (
        <div className="h-screen w-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ repeat: Infinity, repeatType: "mirror", duration: 1 }}
            className="w-12 h-12 rounded-full border-4 border-neutral-400 border-t-transparent animate-spin"
          />
        </div>
      ) : (
        <Table heading={"All Users"} columns={columns} rows={rows} />
      )}
    </AdminLayout>
  );
};

export default UserManagement;
