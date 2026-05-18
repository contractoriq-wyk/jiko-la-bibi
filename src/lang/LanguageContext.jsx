import { createContext, useContext, useState } from "react";
import { ui } from "../i18n";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  // Always starts in Swahili — primary language for Tanzania
  const [lang, setLang] = useState("sw");

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
