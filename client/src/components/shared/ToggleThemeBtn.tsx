import { useTheme } from "@/lib/ThemeProvider";
import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";

const ToggleThemeBtn = ({ className }: { className: string }) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full text-neutral-900 dark:text-neutral-100 p-3",
        className
      )}
      onClick={toggleTheme}
      aria-label="Toggle Theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
            transition={{ duration: 0.3 }}
            className="flex "
          >
            <Moon className="p-[2px]" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: -90 }}
            transition={{ duration: 0.3 }}
            className="flex "
          >
            <Sun className="p-[2px]" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};

export default ToggleThemeBtn;
