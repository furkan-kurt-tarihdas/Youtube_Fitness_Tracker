import React, { createContext, useState, useContext } from 'react';
import { colors } from '../utils/colors';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [activeHomeTabColor, setActiveHomeTabColor] = useState(colors.primary);

  const setHomeTabColor = (color) => setActiveHomeTabColor(color || colors.primary);
  const resetHomeTabColor = () => setActiveHomeTabColor(colors.primary);

  return (
    <ThemeContext.Provider value={{ activeHomeTabColor, setHomeTabColor, resetHomeTabColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
