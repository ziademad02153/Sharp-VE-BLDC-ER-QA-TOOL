import React, { createContext, useContext, useEffect, useState } from 'react';
import { translations, Language } from '../locales';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Read initial language from localStorage or default to Arabic
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-lang') as Language;
    return saved && (saved === 'ar' || saved === 'en') ? saved : 'ar';
  });

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('app-lang', language);
    // Update HTML dir and lang attributes
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  const t = (key: string): string => {
    const dict = translations[language];
    // @ts-ignore
    return dict[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
