import { createContext, useContext, useEffect, useState } from "react";
import { translations, LANGUAGES } from "./translations.js";
import { servicesTranslations } from "../data/services.js";

const STORAGE_KEY = "proton-lang";
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return "en";
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return LANGUAGES.some((l) => l.code === saved) ? saved : "en";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = translations[lang];
  const serviceCopy = servicesTranslations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, serviceCopy, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
