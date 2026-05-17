// ============================================================
//  LANGUAGE STATE  —  Swahili (default) / English toggle.
// ============================================================
import { createContext, useContext, useEffect, useState } from "react";
import { ui } from "../i18n";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("jiko-lang") || "sw";
    } catch {
      return "sw";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("jiko-lang", lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const t = (key) => ui[lang][key] ?? key;
  const toggle = () => setLang((l) => (l === "sw" ? "en" : "sw"));

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside <LanguageProvider>");
  return ctx;
}
