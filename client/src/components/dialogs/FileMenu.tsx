import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIsFileMenu, setUploadingLoader } from "../../redux/reducers/misc";
import { FileImage, FileAudio, FileVideo, FileUp } from "lucide-react";
import { toast } from "sonner";
import { useSendAttachmentsMutation } from "../../redux/api/api";
import { motion, AnimatePresence } from "framer-motion";

const FileMenu = ({
  anchorE1,
  chatId,
}: {
  anchorE1: HTMLElement | null;
  chatId: string;
}) => {
  const { isFileMenu } = useSelector(
    (state: {
      misc: {
        isFileMenu: boolean;
      };
    }) => state.misc
  );
  const dispatch = useDispatch();

  const imageRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [sendAttachments] = useSendAttachmentsMutation();

  const closeFileMenu = () => dispatch(setIsFileMenu(false));

  const fileChangeHandler = async (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    const files = Array.from(e.target.files || []);

    if (files.length <= 0) return;

    if (files.length > 5)
      return toast.error(`You can only send 5 ${key} at a time`);

    dispatch(setUploadingLoader(true));

    const toastId = toast.loading(`Sending ${key}...`);
    closeFileMenu();

    try {
      const myForm = new FormData();
      myForm.append("chatId", chatId);
      files.forEach((file) => myForm.append("files", file));

      const res = await sendAttachments(myForm);

      if (res.data) toast.success(`${key} sent successfully`, { id: toastId });
      else toast.error(`Failed to send ${key}`, { id: toastId });
    } catch (error) {
      toast.error(String(error), { id: toastId });
    } finally {
      dispatch(setUploadingLoader(false));
    }
  };

  const menuItems = [
    {
      label: "Image",
      icon: <FileImage size={18} />,
      action: () => imageRef.current?.click(),
      accept: "image/png, image/jpeg, image/gif",
      ref: imageRef,
      key: "Images",
    },
    {
      label: "Audio",
      icon: <FileAudio size={18} />,
      action: () => audioRef.current?.click(),
      accept: "audio/mpeg, audio/wav",
      ref: audioRef,
      key: "Audios",
    },
    {
      label: "Video",
      icon: <FileVideo size={18} />,
      action: () => videoRef.current?.click(),
      accept: "video/mp4, video/webm, video/ogg",
      ref: videoRef,
      key: "Videos",
    },
    {
      label: "File",
      icon: <FileUp size={18} />,
      action: () => fileRef.current?.click(),
      accept: "*",
      ref: fileRef,
      key: "Files",
    },
  ];

  return (
    <AnimatePresence>
      {isFileMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute right-4 top-12 z-50 w-44 rounded-md border border-neutral-700 bg-neutral-900 shadow-lg"
        >
          <ul className="flex flex-col">
            {menuItems.map((item) => (
              <li
                key={item.label}
                onClick={item.action}
                className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800 cursor-pointer transition-colors"
              >
                {item.icon}
                <span>{item.label}</span>
                <input
                  type="file"
                  multiple
                  accept={item.accept}
                  className="hidden"
                  ref={item.ref}
                  onChange={(e) => fileChangeHandler(e, item.key)}
                />
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FileMenu;
