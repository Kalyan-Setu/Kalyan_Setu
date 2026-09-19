import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';
import orTranslations from './locales/or.json';

export const LANGUAGE_KEY = 'kalyan_setu_language';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English (EN)', shortLabel: 'EN' },
  { code: 'hi', label: 'हिंदी (HI)', shortLabel: 'HI' },
  { code: 'or', label: 'ଓଡ଼ିଆ (ODIA)', shortLabel: 'ODIA' }
];

const getInitialLanguage = () => {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved && ['en', 'hi', 'or'].includes(saved)) {
      return saved;
    }
  } catch (e) {
    console.warn('Unable to read language preference from localStorage:', e);
  }
  return 'en';
};

const initialLang = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      hi: { translation: hiTranslations },
      or: { translation: orTranslations }
    },
    lng: initialLang,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    }
  });

// Synchronize HTML document lang attribute
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLang;
}

export default i18n;
