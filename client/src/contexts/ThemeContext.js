import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const THEME_STORAGE_KEY = "theme";
const LIGHT_THEME = "light";
const DARK_THEME = "dark";

const ThemeContext = createContext(undefined);

function readInitialTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === DARK_THEME || savedTheme === LIGHT_THEME) {
      return savedTheme;
    }
  } catch (error) {
    // Ignore localStorage errors and default to light mode.
  }

  return LIGHT_THEME;
}

function applyThemeClass(theme) {
  document.documentElement.classList.toggle("dark", theme === DARK_THEME);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitialTheme);

  useEffect(() => {
    applyThemeClass(theme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      // Ignore localStorage errors to avoid breaking UI interactions.
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) =>
      prevTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME
    );
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDarkMode: theme === DARK_THEME,
      toggleTheme,
    }),
    [theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
