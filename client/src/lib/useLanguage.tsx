import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode, memo } from 'react';
import { Language, getTranslation, languages as i18nLanguages, getCantonName, getCityName, getCantonNameFromCode } from './i18n';

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

// Memoized provider to prevent unnecessary re-renders
export const LanguageProvider = memo(function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Only access localStorage on mount
    if (typeof window === 'undefined') return 'fr';
    const saved = localStorage.getItem('hoomy_lang') as Language;
    return saved && languages.some(l => l.code === saved) ? saved : 'fr';
  });

  useEffect(() => {
    localStorage.setItem('hoomy_lang', language);
    // Update HTML lang attribute for accessibility
    document.documentElement.lang = language === 'de-ch' ? 'de' : language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  // Memoized translation function - only recreated when language changes
  const t = useCallback((key: string, params?: Record<string, any>) => {
    return getTranslation(key, language, params);
  }, [language]);

  const getCantonNameLocal = useCallback((canton: { code: string; name_fr: string; name_de: string }) => {
    return getCantonName(canton, language);
  }, [language]);

  const getCityNameLocal = useCallback((cityName: string) => {
    return getCityName(cityName, language);
  }, [language]);

  const getCantonNameFromCodeLocal = useCallback((cantonCode: string) => {
    return getCantonNameFromCode(cantonCode, language);
  }, [language]);

  // Memoize the context value to prevent re-renders
  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    getCantonName: getCantonNameLocal,
    getCityName: getCityNameLocal,
    getCantonNameFromCode: getCantonNameFromCodeLocal,
  }), [language, setLanguage, t, getCantonNameLocal, getCityNameLocal, getCantonNameFromCodeLocal]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
});

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

