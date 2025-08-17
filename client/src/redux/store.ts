import { configureStore } from "@reduxjs/toolkit";
import authSlice from "@/redux/reducers/auth";
import api from "@/redux/api/api";
import miscSlice from "@/redux/reducers/misc";
import chatSlice from "@/redux/reducers/chat";

const store = configureStore({
  reducer: {
    [authSlice.name]: authSlice.reducer,
    [miscSlice.name]: miscSlice.reducer,
    [chatSlice.name]: chatSlice.reducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (mid) => mid().concat(api.middleware),
});

export default store;
