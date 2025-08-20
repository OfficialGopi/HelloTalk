import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIsFileMenu, setUploadingLoader } from "../../redux/reducers/misc";
import { useSendAttachmentsMutation } from "../../redux/api/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Music as AudioIcon,
  Video as VideoIcon,
  File as FileIcon,
  X,
} from "lucide-react";

interface FileMenuProps {
  chatId: string;
}

const FileMenu: React.FC<FileMenuProps> = ({ chatId }) => {
  const { isFileMenu } = useSelector((state: any) => state.misc);
  const dispatch = useDispatch();

  const imageRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [sendAttachments] = useSendAttachmentsMutation();

  const closeFileMenu = () => dispatch(setIsFileMenu(!isFileMenu));

  const selectImage = () => imageRef.current?.click();
  const selectAudio = () => audioRef.current?.click();
  const selectVideo = () => videoRef.current?.click();
  const selectFile = () => fileRef.current?.click();

  const fileChangeHandler = async (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    const files = e.target.files ? Array.from(e.target.files) : [];

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
    } catch (error: any) {
      toast.error(error?.message || "Upload failed", { id: toastId });
    } finally {
      dispatch(setUploadingLoader(false));
    }
  };

  const menuItems = [
    {
      label: "Image",
      icon: <ImageIcon className="w-5 h-5" />,
      action: selectImage,
      ref: imageRef,
      accept: "image/png, image/jpeg, image/gif",
    },
    {
      label: "Audio",
      icon: <AudioIcon className="w-5 h-5" />,
      action: selectAudio,
      ref: audioRef,
      accept: "audio/mpeg, audio/wav",
    },
    {
      label: "Video",
      icon: <VideoIcon className="w-5 h-5" />,
      action: selectVideo,
      ref: videoRef,
      accept: "video/mp4, video/webm, video/ogg",
    },
    {
      label: "File",
      icon: <FileIcon className="w-5 h-5" />,
      action: selectFile,
      ref: fileRef,
      accept: "*",
    },
  ];

  return (
    <AnimatePresence>
      {isFileMenu && (
        <>
          {/* Overlay */}
          <motion.button
            className="fixed inset-0 z-40 "
            onClick={(e) => {
              e.stopPropagation();
              closeFileMenu();
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
          />

          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="absolute z-50 w-40 rounded-xl shadow-lg 
                       bg-neutral-100 dark:bg-neutral-900 border 
                       border-neutral-300 dark:border-neutral-700 bottom-[150%] left-1/2 "
          >
            <div className="flex justify-between items-center px-3 py-2 border-b border-neutral-300 dark:border-neutral-700">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Send
              </span>
              <button onClick={closeFileMenu}>
                <X className="w-4 h-4 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300" />
              </button>
            </div>

            <ul className="flex flex-col" onClick={(e) => e.stopPropagation()}>
              {menuItems.map(({ label, icon, action, ref, accept }) => (
                <li
                  key={label}
                  onClick={action}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer
                             text-neutral-700 dark:text-neutral-300
                             hover:bg-neutral-200 dark:hover:bg-neutral-800
                             transition-colors"
                >
                  {icon}
                  <span className="text-sm">{label}</span>
                  <input
                    type="file"
                    multiple
                    accept={accept}
                    className="hidden"
                    ref={ref}
                    onChange={(e) => fileChangeHandler(e, `${label}s`)}
                  />
                </li>
              ))}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FileMenu;
