import { SERVER_API_URL } from "@/constants/config";
import axios from "axios";

const api = axios.create({
  baseURL: SERVER_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
