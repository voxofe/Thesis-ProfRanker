import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import translations from "./translations";

const LANGUAGE_STORAGE_KEY = "language";
const DEFAULT_LANGUAGE = "el";
const SUPPORTED_LANGUAGES = ["el", "en"];

const LanguageContext = createContext(undefined);

function readInitialLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (SUPPORTED_LANGUAGES.includes(saved)) {
      return saved;
    }
  } catch (error) {
    // Ignore localStorage errors and default to Greek.
  }

  return DEFAULT_LANGUAGE;
}

// Resolve a dot-path (e.g. "login.submit") within a translation tree.
function lookup(tree, key) {
  return key.split(".").reduce((node, part) => {
    if (node && typeof node === "object" && part in node) {
      return node[part];
    }
    return undefined;
  }, tree);
}

// Replace {name} placeholders with values from `vars`.
function interpolate(text, vars) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) =>
    name in vars ? String(vars[name]) : match
  );
}

function translate(language, key, vars) {
  const primary = lookup(translations[language], key);
  if (typeof primary === "string") {
    return interpolate(primary, vars);
  }

  // Fall back to the default language, then to the key itself.
  const fallback = lookup(translations[DEFAULT_LANGUAGE], key);
  if (typeof fallback === "string") {
    return interpolate(fallback, vars);
  }

  return key;
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readInitialLanguage);

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      // Ignore localStorage errors to avoid breaking UI interactions.
    }
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  const setLanguage = useCallback((next) => {
    if (SUPPORTED_LANGUAGES.includes(next)) {
      setLanguageState(next);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === "el" ? "en" : "el"));
  }, []);

  const t = useCallback(
    (key, vars) => translate(language, key, vars),
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t }),
    [language, setLanguage, toggleLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}
