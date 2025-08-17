import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "@/constants/config";
import axios, { AxiosError } from "axios";

const adminLogin = createAsyncThunk("admin/login", async (secretKey) => {
  try {
    const config = {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.post(
      `${server}/api/v1/admin/verify`,
      { secretKey },
      config
    );

    return data.data.message;
  } catch (error) {
    throw ((error as unknown as AxiosError)?.response?.data as any)?.message;
  }
});

const getAdmin = createAsyncThunk("admin/getAdmin", async () => {
  try {
    const { data } = await axios.get(`${server}/api/v1/admin/`, {
      withCredentials: true,
    });

    return data.admin;
  } catch (error) {
    throw ((error as unknown as AxiosError)?.response?.data as any)?.message;
  }
});

const adminLogout = createAsyncThunk("admin/logout", async () => {
  try {
    const { data } = await axios.get(`${server}/api/v1/admin/logout`, {
      withCredentials: true,
    });

    return data.message;
  } catch (error) {
    throw ((error as unknown as AxiosError)?.response?.data as any)?.message;
  }
});

export { adminLogin, getAdmin, adminLogout };
