import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { services } from '../core/container';
import type { SiteSettings } from '../core/domain/types';

interface SettingsContextValue {
  settings: SiteSettings;
  saveSettings: (settings: SiteSettings) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(() => services.settings.get());

  useEffect(
    () =>
      services.themes.subscribe(() => {
        setSettings(services.settings.get());
      }),
    [],
  );

  const value: SettingsContextValue = {
    settings,
    saveSettings: async (next) => {
      await services.settings.save(next);
      setSettings(next);
    },
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
