import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import bn from "./locales/bn.json";
import de from "./locales/de.json";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import hi from "./locales/hi.json";
import kn from "./locales/kn.json";

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  kn: { translation: kn },
  bn: { translation: bn },
  fr: { translation: fr },
  de: { translation: de },
};

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources,
  lng: "en", 
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
