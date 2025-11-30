import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getTranslation, languages as i18nLanguages, getCantonName, getCityName, getCantonNameFromCode, translations } from './i18n';

export const languages = i18nLanguages;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
  getCantonName: (canton: { code: string; name_fr: string; name_de: string }) => string;
  getCityName: (cityName: string) => string;
  getCantonNameFromCode: (cantonCode: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('hoomy_lang') as Language;
    // S'assurer que languages est un tableau valide
    if (saved && Array.isArray(languages) && languages.length > 0) {
      return languages.some(l => l && l.code === saved) ? saved : 'fr';
    }
    return 'fr';
  });

  useEffect(() => {
    localStorage.setItem('hoomy_lang', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, params?: Record<string, any>) => {
    const result = getTranslation(key, language, params);
    // Debug: log if translation is missing (only in dev)
    if (result === key && !translations[language]?.[key] && import.meta.env.DEV) {
      console.warn(`Missing translation for key "${key}" in language "${language}"`);
    }
    return result;
  };

  const getCantonNameLocal = (canton: { code: string; name_fr: string; name_de: string }) => {
    return getCantonName(canton, language);
  };

  const getCityNameLocal = (cityName: string) => {
    return getCityName(cityName, language);
  };

  const getCantonNameFromCodeLocal = (cantonCode: string) => {
    return getCantonNameFromCode(cantonCode, language);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getCantonName: getCantonNameLocal, getCityName: getCityNameLocal, getCantonNameFromCode: getCantonNameFromCodeLocal }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

