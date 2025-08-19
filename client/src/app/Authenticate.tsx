import { useState } from "react";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "motion/react";
import { Camera } from "lucide-react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { useFileHandler, useInputValidation } from "6pp";
import { userExists } from "@/redux/reducers/auth";
import { emailValidator, usernameValidator } from "@/utils/features";
import ToggleThemeBtn from "@/components/shared/ToggleThemeBtn";
import api from "@/utils/axiosInstace.util";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const name = useInputValidation("");
  const email = useInputValidation("");
  const bio = useInputValidation("");
  const username = useInputValidation("", usernameValidator);
  const password = useInputValidation("", emailValidator);
  const avatar = useFileHandler("single");

  const dispatch = useDispatch();

  const toggleLogin = () => setIsLogin((prev) => !prev);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Logging In...");
    setIsLoading(true);

    try {
      const { data } = await api.post(`/user/login`, {
        username: username.value,
        password: password.value,
      });
      dispatch(userExists(data.data));
      toast.success(data.message, { id: toastId });
    } catch (error) {
      toast.error(
        ((error as AxiosError).response?.data as any).message ||
          "Something Went Wrong",
        {
          id: toastId,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Signing Up...");
    setIsLoading(true);

    const formData = new FormData();
    formData.append("avatar", avatar.file!);
    formData.append("email", email.value!);
    formData.append("name", name.value);
    formData.append("bio", bio.value);
    formData.append("username", username.value);
    formData.append("password", password.value);

    try {
      const { data } = await api.post(`/user/new`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(userExists(data.data));
      toast.success(data.message, { id: toastId });
    } catch (error) {
      toast.error(
        ((error as AxiosError).response?.data as any).message ||
          "Something Went Wrong",
        {
          id: toastId,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      isLogin={isLogin}
      toggleLogin={toggleLogin}
      handleLogin={handleLogin}
      handleSignUp={handleSignUp}
      isLoading={isLoading}
      avatar={avatar}
      name={name}
      bio={bio}
      username={username}
      password={password}
      email={email}
    />
  );
};

export default Login;

const AuthCard = ({
  isLogin,
  toggleLogin,
  handleLogin,
  handleSignUp,
  isLoading,
  avatar,
  name,
  bio,
  username,
  password,
  email,
}: any) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-200 dark:bg-neutral-950 px-4 text-sm relative">
      <ToggleThemeBtn className="absolute top-4 right-4  rounded-full cursor-pointer p-2 border border-neutral-500/50" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md border-neutral-500/50 border shadow-xl rounded-lg p-8 flex flex-col items-center"
      >
        {/* Logo */}
        <motion.img
          src="/logo.png"
          alt="Logo"
          className="w-16 h-16 mb-4 rounded-md"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        />

        {/* Title */}
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {isLogin ? "Welcome Back" : "Join Us"}
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 text-center">
          {isLogin
            ? "Log in to continue your journey "
            : "Sign up and be part of something great "}
        </p>

        {/* AnimatePresence for toggle */}
        <AnimatePresence mode="wait">
          <motion.form
            key={isLogin ? "login" : "signup"}
            onSubmit={isLogin ? handleLogin : handleSignUp}
            className="w-full space-y-4"
            initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, scale: 0.95, filter: "blur(6px)" }}
            transition={{ duration: 0.4 }}
          >
            {/* SignUp Extra Fields */}
            {!isLogin && (
              <>
                <div className="relative w-24 h-24 mx-auto">
                  <img
                    src={avatar.preview || "/default-avatar.png"}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                  />
                  <label className="absolute bottom-0 right-0 bg-black/50 hover:bg-black/70 p-2 rounded-full cursor-pointer">
                    <Camera className="text-white w-4 h-4" />
                    <input
                      type="file"
                      onChange={avatar.changeHandler}
                      className="hidden"
                    />
                  </label>
                </div>
                {avatar.error && (
                  <p className="text-red-500 text-xs text-center">
                    {avatar.error}
                  </p>
                )}

                <input
                  type="text"
                  placeholder="Name"
                  value={name.value}
                  onChange={name.changeHandler}
                  className="w-full px-4 py-2 border rounded-md bg-transparent text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-neutral-400 outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email.value}
                  onChange={email.changeHandler}
                  className="w-full px-4 py-2 border rounded-md bg-transparent text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-neutral-400 outline-none"
                />
                <input
                  type="text"
                  placeholder="Bio"
                  value={bio.value}
                  onChange={bio.changeHandler}
                  className="w-full px-4 py-2 border rounded-md bg-transparent text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-neutral-400 outline-none"
                />
              </>
            )}

            {/* Common Fields */}
            <input
              type="text"
              placeholder="Username"
              value={username.value}
              onChange={username.changeHandler}
              className="w-full px-4 py-2 border rounded-md bg-transparent text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-neutral-400 outline-none"
            />
            {username.error && (
              <p className="text-red-500 text-xs">{username.error}</p>
            )}

            <input
              type="password"
              placeholder="Password"
              value={password.value}
              onChange={password.changeHandler}
              className="w-full px-4 py-2 border rounded-md bg-transparent text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-neutral-400 outline-none"
            />

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-2 rounded-md border border-neutral-500/50 bg-transparent text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition cursor-pointer disabled:opacity-50"
            >
              {isLogin ? "Login" : "Sign Up"}
            </motion.button>
          </motion.form>
        </AnimatePresence>

        {/* Toggle */}
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-6">
          {isLogin ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={toggleLogin}
            className="text-neutral-900 dark:text-neutral-100 font-medium hover:underline cursor-pointer"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};
