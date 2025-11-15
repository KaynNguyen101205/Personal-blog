import { useCallback, useEffect, useState } from "react";

const THEME_KEY = "theme";

const getStoredMode = () => {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(THEME_KEY);
  return stored === "dark" ? "dark" : "light";
};

const createPalette = (mode) => {
  const isDark = mode === "dark";
  return {
    isDark,
    pageBackground: isDark ? "#0F2130" : "#F9F3EF",
    surfaceBackground: isDark ? "#1B3C53" : "#FFFFFF",
    chipBackground: isDark ? "#23445E" : "#F2E8E2",
    textPrimary: isDark ? "#F2E9E2" : "#1B3C53",
    textSecondary: isDark ? "#CAD6E3" : "#456882",
    accent: "#456882",
    border: isDark ? "#2A5370" : "#D2C1B6",
    shadowLight: isDark ? "#2A5370" : "#FFFFFF",
    shadowDark: isDark ? "#0D1F2A" : "#D9CEC4",
    copyright: isDark ? "#90A8BF" : "#56738F"
  };
};

export const getThemePalette = (mode) => createPalette(mode);

export function useTheme() {
  const [mode, setMode] = useState(() => getStoredMode());

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === THEME_KEY) {
        setMode(event.newValue === "dark" ? "dark" : "light");
      }
    };

    const handleCustom = () => {
      setMode(getStoredMode());
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("theme:changed", handleCustom);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("theme:changed", handleCustom);
    };
  }, []);

  const setTheme = useCallback(
    (nextMode) => {
      const normalized = nextMode === "dark" ? "dark" : "light";
      setMode(normalized);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(THEME_KEY, normalized);
        window.dispatchEvent(new Event("theme:changed"));
      }
    },
    []
  );

  const toggleTheme = useCallback(() => {
    setTheme(mode === "dark" ? "light" : "dark");
  }, [mode, setTheme]);

  const palette = createPalette(mode);

  return {
    isDarkMode: mode === "dark",
    mode,
    palette,
    setTheme,
    toggleTheme
  };
}


