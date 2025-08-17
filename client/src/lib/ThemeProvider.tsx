import { getOrSaveFromStorage } from "@/utils/features";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext<{
  toggleTheme: () => void;
  theme: "light" | "dark";
} | null>(null);

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<"light" | "dark">(
    getOrSaveFromStorage({ key: "hello-talk-theme", get: true }) ?? "light"
  );

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    getOrSaveFromStorage({
      key: "hello-talk-theme",
      value: newTheme,
    });
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return {
    toggleTheme: context.toggleTheme,
    isDark: context.theme === "dark",
  };
};

export { useTheme };
export default ThemeProvider;
