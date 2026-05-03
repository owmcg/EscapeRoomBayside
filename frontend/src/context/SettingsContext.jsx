import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [epilepsySafe, setEpilepsySafe] = useState(() => {
    const saved = localStorage.getItem('epilepsySafe');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('epilepsySafe', JSON.stringify(epilepsySafe));
  }, [epilepsySafe]);

  const toggleEpilepsySafe = () => setEpilepsySafe(!epilepsySafe);

  return (
    <SettingsContext.Provider value={{ epilepsySafe, toggleEpilepsySafe }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
