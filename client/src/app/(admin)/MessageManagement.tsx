import { useFetchData } from "6pp";
import moment from "moment";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AdminLayout from "../../components/layout/AdminLayout";
import RenderAttachment from "../../components/shared/RenderAttachment";
import Table from "../../components/shared/Table";
import { SERVER_API_URL } from "../../constants/config";
import { useErrors } from "../../hooks/hook";
import { fileFormat, transformImage } from "@/utils/features";

const columns = [
  {
    field: "id",
    headerName: "ID",
    headerClassName: "table-header",
    width: 200,
  },
  {
    field: "attachments",
    headerName: "Attachments",
    headerClassName: "table-header",
    width: 200,
    renderCell: (params: any) => {
      const { attachments } = params.row;

      return attachments?.length > 0
        ? attachments.map((i: any, index: number) => {
            const url = i.url;
            const file = fileFormat(url);

            return (
              <div key={index} className="p-1">
                <a
                  href={url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {RenderAttachment(file, url)}
                </a>
              </div>
            );
          })
        : "No Attachments";
    },
  },
  {
    field: "content",
    headerName: "Content",
    headerClassName: "table-header",
    width: 400,
  },
  {
    field: "sender",
    headerName: "Sent By",
    headerClassName: "table-header",
    width: 200,
    renderCell: (params: any) => (
      <div className="flex items-center gap-3">
        <img
          src={params.row.sender.avatar}
          alt={params.row.sender.name}
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-sm font-medium">{params.row.sender.name}</span>
      </div>
    ),
  },
  {
    field: "chat",
    headerName: "Chat",
    headerClassName: "table-header",
    width: 220,
  },
  {
    field: "groupChat",
    headerName: "Group Chat",
    headerClassName: "table-header",
    width: 100,
  },
  {
    field: "createdAt",
    headerName: "Time",
    headerClassName: "table-header",
    width: 250,
  },
];

const MessageManagement = () => {
  const {
    loading,
    data,
    error,
  }: {
    loading: boolean;
    data: any;
    error: any;
  } = useFetchData({
    url: `${SERVER_API_URL}/admin/messages`,
    key: "dashboard-messages",
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
        data.data.map((i: any) => ({
          ...i,
          id: i._id,
          sender: {
            name: i.sender.name,
            avatar: transformImage(i.sender.avatar, 50),
          },
          createdAt: moment(i.createdAt).format("MMMM Do YYYY, h:mm:ss a"),
        }))
      );
    }
  }, [data]);

  return (
    <AdminLayout>
      {loading ? (
        <div className="w-full h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="animate-pulse w-3/4 h-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full"
        >
          <Table
            heading={"All Messages"}
            columns={columns}
            rows={rows}
            rowHeight={200}
          />
        </motion.div>
      )}
    </AdminLayout>
  );
};

export default MessageManagement;
