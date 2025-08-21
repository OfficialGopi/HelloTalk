import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "@/utils/axiosInstace.util";

const adminLogin = createAsyncThunk(
  "admin/login",
  async (secretKey: string) => {
    try {
      const { data } = await api.post(`/admin/verify`, { secretKey });

      return data.message;
    } catch (error) {
      throw (
        ((error as unknown as AxiosError)?.response?.data as any)?.message ??
        "Something went wrong"
      );
    }
  }
);

const getAdmin = createAsyncThunk("admin/getAdmin", async () => {
  try {
    const { data } = await api.get(`/admin`);

    return data.data;
  } catch (error) {
    throw (
      ((error as unknown as AxiosError)?.response?.data as any)?.message ??
      "Something went wrong"
    );
  }
});

const adminLogout = createAsyncThunk("admin/logout", async () => {
  try {
    const { data } = await api.get(`/admin/logout`);

    return data.message;
  } catch (error) {
    throw (
      ((error as unknown as AxiosError)?.response?.data as any)?.message ??
      "Something went wrong"
    );
  }
});

export { adminLogin, getAdmin, adminLogout };
