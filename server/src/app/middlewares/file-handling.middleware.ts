import multer from "multer";
import path from "path";

function upload(path: string, maxSizeInMb: number): multer.Multer {
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path);
      },
      filename: (_, file, cb) => {
        let fileExtension = "";
        if (file.originalname.split(".").length > 1) {
          fileExtension = file.originalname.substring(
            file.originalname.lastIndexOf("."),
          );
        }
        const filenameWithoutExtension = file.originalname
          .toLowerCase()
          .split(" ")
          .join("-")
          ?.split(".")[0];
        cb(
          null,
          filenameWithoutExtension +
            Date.now() +
            Math.ceil(Math.random() * 1e5) + // avoid rare name conflict
            fileExtension,
        );
      },
    }),
    limits: {
      fileSize: maxSizeInMb * 1024 * 1024,
    },
  });
}

const uploadSingleAvatar = upload(
  path.join(__dirname, "../../../", "temp", "avatars"),
  5,
).single("avatar");

const uploadAttachments = upload(
  path.join(__dirname, "../../../", "temp", "attachments"),
  10,
).array("files", 5);

export { uploadSingleAvatar, uploadAttachments };
