import { memo, useState } from "react";
import moment from "moment";
import { fileFormat } from "@/utils/features";
import RenderAttachment from "./RenderAttachment";
import { AnimatePresence, motion } from "framer-motion";
import Modal from "@/components/ui/Modal";

const MessageComponent = ({ data, user }: { data: any; user: any }) => {
  const { sender, content, attachments = [], createdAt } = data;
  const sameSender = sender?._id === user?._id;
  const timeAgo = moment(createdAt).fromNow();

  const [selectedAttachment, setSelectedAttachment] = useState<any>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: sameSender ? 60 : -60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative max-w-xs md:max-w-md lg:max-w-lg px-4 py-2.5 rounded-2xl shadow-sm 
    ${
      sameSender
        ? "self-end bg-neutral-800 text-neutral-100"
        : "self-start bg-neutral-700 text-neutral-100"
    }`}
    >
      {/* Sender Name */}
      {!sameSender && (
        <p className="text-xs font-semibold text-orange-400 mb-1 tracking-wide">
          {sender.name}
        </p>
      )}

      {/* Message Content */}
      {content && (
        <p className="text-sm leading-relaxed break-words">{content}</p>
      )}

      {/* Attachments */}

      {attachments.length > 0 && (
        <div className="space-y-2 mt-2">
          {attachments.map((attachment: any, index: number) => {
            const url = attachment.url;
            const file = fileFormat(url);

            return (
              <div
                key={index}
                className="group relative p-2 rounded-lg bg-neutral-600 hover:bg-neutral-500/80 transition"
                onClick={() =>
                  setSelectedAttachment({
                    url,
                    file,
                  })
                }
              >
                <div
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-orange-300 hover:text-orange-400 text-sm font-medium"
                >
                  {RenderAttachment(file, url)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Timestamp */}
      <p className="text-[11px] text-neutral-400 mt-2 text-right">{timeAgo}</p>

      <AnimatePresence>
        {selectedAttachment && (
          <Modal
            key={selectedAttachment.url}
            isOpen={!!selectedAttachment}
            onClose={() => setSelectedAttachment(null)}
          >
            <div className="flex flex-col items-center justify-center space-y-4 p-4">
              {/* Render the attachment */}
              <div className="max-w-full max-h-[70vh] overflow-auto">
                {RenderAttachment(
                  selectedAttachment.file,
                  selectedAttachment.url
                )}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
      {/* Subtle Accent Dot for sender */}
    </motion.div>
  );
};

export default memo(MessageComponent);
