import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { services } from '../core/container';
import type { HolidayTheme } from '../core/domain/HolidayTheme';
import type { HolidayThemeData } from '../core/domain/types';

interface ThemeContextValue {
  theme: HolidayTheme;
  themes: HolidayTheme[];
  setActiveTheme: (id: string) => Promise<void>;
  addCustomTheme: (data: HolidayThemeData) => Promise<void>;
  removeCustomTheme: (id: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(() => services.themes.activeTheme);
  const [themes, setThemes] = useState(() => services.themes.themes);

  useEffect(
    () =>
      services.themes.subscribe(() => {
        setTheme(services.themes.activeTheme);
        setThemes(services.themes.themes);
      }),
    [],
  );

  const value: ThemeContextValue = {
    theme,
    themes,
    setActiveTheme: (id) => services.themes.setActiveTheme(id),
    addCustomTheme: (data) => services.themes.addCustomTheme(data),
    removeCustomTheme: (id) => services.themes.removeCustomTheme(id),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
