import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CircleSlash } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  // Redirect after 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    const redirect = setTimeout(() => navigate("/"), 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center px-4">
      <div className="flex flex-col items-center space-y-8 text-center">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -90, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
        >
          <CircleSlash className="w-40 h-40 text-neutral-700 dark:text-neutral-400 drop-shadow-lg" />
        </motion.div>

        {/* 404 Title */}
        <motion.h1
          className="text-7xl md:text-8xl font-extrabold bg-gradient-to-r from-neutral-800 via-neutral-600 to-neutral-400 dark:from-neutral-200 dark:via-neutral-400 dark:to-neutral-600 bg-clip-text text-transparent drop-shadow-md"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          404
        </motion.h1>

        {/* Subtitle */}
        <motion.h2
          className="text-2xl md:text-3xl font-medium text-neutral-700 dark:text-neutral-300"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Page Not Found
        </motion.h2>

        {/* Countdown */}
        <motion.p
          className="text-lg text-neutral-600 dark:text-neutral-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Redirecting to <span className="font-semibold">Home</span> in{" "}
          <span className="text-neutral-900 dark:text-neutral-100 font-bold">
            {countdown}
          </span>{" "}
          seconds...
        </motion.p>

        {/* Go Home Link (manual option) */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900 font-medium shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            Go back now
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
