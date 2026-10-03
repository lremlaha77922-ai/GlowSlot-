import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '../locales/en.json';
import hiTranslations from '../locales/hi.json';

export const defaultNS = 'translation';
export const resources = {
  en: {
    translation: enTranslations,
  },
  hi: {
    translation: hiTranslations,
  },
} as const;

i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    resources,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export const changeLanguage = (lang: 'en' | 'hi') => {
  return i18n.changeLanguage(lang);
};

export default i18n;
