import { createContext, useContext, useEffect, type ReactNode } from "react";

type Theme = "dark";
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void; setTheme: (t: Theme) => void }>({
  theme: "dark",
  toggle: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.style.colorScheme = "dark";
    // Clear any previously saved theme preference
    try { window.localStorage.removeItem("alpha-theme"); } catch {}
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme: "dark", setTheme: () => {}, toggle: () => {} }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
