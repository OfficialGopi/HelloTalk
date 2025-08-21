import { useInputValidation } from "6pp";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { adminLogin, getAdmin } from "@/redux/thunks/admin";

const AdminLogin = () => {
  const { isAdmin } = useSelector((state: { auth: any }) => state.auth);
  const dispatch = useDispatch();

  const secretKey = useInputValidation("");

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(adminLogin(secretKey.value) as any);
  };

  useEffect(() => {
    dispatch(getAdmin() as any);
  }, [dispatch]);

  if (isAdmin) return <Navigate to="/admin/dashboard" />;

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm bg-neutral-100 dark:bg-neutral-950 shadow-xl rounded-2xl p-8 border border-neutral-500/50"
      >
        <h1 className="text-2xl font-semibold text-center text-neutral-800 dark:text-neutral-200">
          Admin Login
        </h1>

        <form onSubmit={submitHandler} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="secretKey"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Secret Key
            </label>
            <input
              id="secretKey"
              required
              type="password"
              value={secretKey.value}
              onChange={secretKey.changeHandler}
              className="mt-1 block w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-3 py-2 focus:ring-2 focus:ring-neutral-500 focus:outline-none"
              placeholder="Enter secret key"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-lg bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900 font-medium hover:opacity-90 transition"
          >
            Login
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
