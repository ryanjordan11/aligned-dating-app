import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./resources/en";
import es from "./resources/es";

const supportedLngs = ["en", "es"] as const;
type SupportedLng = (typeof supportedLngs)[number];

function readInitialLanguage(): SupportedLng {
  try {
    const stored = window.localStorage.getItem("aligned_lang");
    if (stored === "en" || stored === "es") return stored;
  } catch {
    // ignore
  }
  return "en";
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: readInitialLanguage(),
  fallbackLng: "en",
  supportedLngs: [...supportedLngs],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;

