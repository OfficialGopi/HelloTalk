import { transformImage } from "@/utils/features";
import { FileIcon } from "lucide-react";

const RenderAttachment = (file: string, url: string) => {
  switch (file) {
    case "video":
      return (
        <video
          src={url}
          preload="none"
          controls
          className="w-52 max-h-40 rounded-md border border-neutral-700 bg-neutral-900"
        />
      );

    case "image":
      return (
        <img
          src={transformImage(url, 200)}
          alt="Attachment"
          className="w-52 h-40 object-contain rounded-md border border-neutral-700 bg-neutral-900"
        />
      );

    case "audio":
      return (
        <audio
          src={url}
          preload="none"
          controls
          className="w-52 mt-1 rounded-md border border-neutral-700 bg-neutral-900"
        />
      );

    default:
      return (
        <div className="flex items-center gap-2 text-neutral-200 bg-neutral-800 px-3 py-2 rounded-md border border-neutral-700">
          <FileIcon className="w-4 h-4 text-neutral-400" />
          <span className="text-sm">Open File</span>
        </div>
      );
  }
};

export default RenderAttachment;
