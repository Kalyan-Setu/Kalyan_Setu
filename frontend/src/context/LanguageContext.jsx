import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n, { LANGUAGE_KEY, SUPPORTED_LANGUAGES } from '../i18n/i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(() => i18n.language || 'en');

  const changeLanguage = useCallback((langCode) => {
    if (!['en', 'hi', 'or'].includes(langCode)) return;
    
    i18n.changeLanguage(langCode);
    setCurrentLanguage(langCode);

    try {
      localStorage.setItem(LANGUAGE_KEY, langCode);
    } catch (e) {
      console.warn('Could not save language to localStorage:', e);
    }

    if (typeof document !== 'undefined') {
      document.documentElement.lang = langCode;
    }
  }, []);

  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setCurrentLanguage(lng);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lng;
      }
    };

    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  const selectedLanguageMeta = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const value = {
    currentLanguage,
    selectedLanguageMeta,
    supportedLanguages: SUPPORTED_LANGUAGES,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
