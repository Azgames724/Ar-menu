import React, { createContext, useContext, useState } from 'react';

type Lang = 'am' | 'en';

interface LanguageContextType {
  lang: Lang;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'am',
  toggle: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>('am');
  const toggle = () => setLang(l => (l === 'am' ? 'en' : 'am'));
  return <LanguageContext.Provider value={{ lang, toggle }}>{children}</LanguageContext.Provider>;
};
