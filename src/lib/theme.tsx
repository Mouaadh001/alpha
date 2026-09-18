import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void; setTheme: (t: Theme) => void }>({
  theme: "dark",
  toggle: () => {},
  setTheme: () => {},
});

function readTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = window.localStorage.getItem("alpha-theme");
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
}

function writeTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("alpha-theme", theme);
  } catch {}
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const initial = readTheme() ?? "dark";
    setThemeState((current) => (current === initial ? current : initial));
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    writeTheme(theme);
  }, [theme]);

  return (
    <ThemeCtx.Provider value={{ theme, setTheme: setThemeState, toggle: () => setThemeState(t => t === "dark" ? "light" : "dark") }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
