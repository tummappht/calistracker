import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [focusMode, setFocusMode] = useState(() => {
    return localStorage.getItem('ct_focus_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('ct_focus_mode', focusMode);
    document.body.classList.toggle('focus-mode', focusMode);
  }, [focusMode]);

  return (
    <ThemeContext.Provider value={{ focusMode, setFocusMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
