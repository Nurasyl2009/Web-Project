import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // Тіл тек 'kk' немесе 'ru' болуын қадағалаймыз
  const savedLang = localStorage.getItem('lang');
  const [language, setLanguage] = useState((savedLang === 'kk' || savedLang === 'ru') ? savedLang : 'kk');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', language);
  }, [language]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <AppContext.Provider value={{ theme, toggleTheme, language, changeLanguage }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
