import { isValidUsername } from "6pp";
const getOrSaveFromStorage = ({
  key,
  value,
  get,
}: {
  key: string;
  value?: any;
  get?: boolean;
}) => {
  if (get)
    return localStorage.getItem(key)
      ? JSON.parse(localStorage.getItem(key) as string)
      : null;
  else localStorage.setItem(key, JSON.stringify(value));
};

const usernameValidator = (username: string) => {
  if (!isValidUsername(username))
    return { isValid: false, errorMessage: "Username is Invalid" };
};

const emailValidator = (email: string) => {
  if (
    !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
      email
    )
  )
    return { isValid: false, errorMessage: "Email is Invalid" };
};

const transformImage = (url = "", width = 100) => {
  const newUrl = url.replace("upload/", `upload/dpr_auto/w_${width}/`);

  return newUrl;
};

const fileFormat = (url = "") => {
  const fileExt = url.split(".").pop();

  if (fileExt === "mp4" || fileExt === "webm" || fileExt === "ogg")
    return "video";

  if (fileExt === "mp3" || fileExt === "wav") return "audio";
  if (
    fileExt === "png" ||
    fileExt === "jpg" ||
    fileExt === "jpeg" ||
    fileExt === "gif"
  )
    return "image";

  return "file";
};

export {
  fileFormat,
  getOrSaveFromStorage,
  usernameValidator,
  transformImage,
  emailValidator,
};
