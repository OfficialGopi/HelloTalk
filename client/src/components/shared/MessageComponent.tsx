import { memo } from "react";
import moment from "moment";
import { fileFormat } from "@/utils/features";
import RenderAttachment from "./RenderAttachment";
import { motion } from "framer-motion";

const MessageComponent = ({ message, user }: { message: any; user: any }) => {
  const { sender, content, attachments = [], createdAt } = message;
  const sameSender = sender?._id === user?._id;
  const timeAgo = moment(createdAt).fromNow();

  return (
    <motion.div
      initial={{ opacity: 0, x: sameSender ? "100%" : "-100%" }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`max-w-xs md:max-w-md lg:max-w-lg px-3 py-2 rounded-md 
        ${
          sameSender
            ? "self-end bg-neutral-800 text-neutral-100"
            : "self-start bg-neutral-700 text-neutral-100"
        }`}
    >
      {/* Sender Name */}
      {!sameSender && (
        <p className="text-xs font-semibold text-sky-400 mb-0.5">
          {sender.name}
        </p>
      )}

      {/* Message Content */}
      {content && <p className="text-sm break-words">{content}</p>}

      {/* Attachments */}
      {attachments.length > 0 &&
        attachments.map((attachment: any, index: number) => {
          const url = attachment.url;
          const file = fileFormat(url);

          return (
            <div key={index} className="mt-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="text-sky-300 underline hover:text-sky-400 text-sm"
              >
                {RenderAttachment(file, url)}
              </a>
            </div>
          );
        })}

      {/* Timestamp */}
      <p className="text-[11px] text-neutral-400 mt-1">{timeAgo}</p>
    </motion.div>
  );
};

export default memo(MessageComponent);
