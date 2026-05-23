import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api'; // Make sure this path is correct, might be utils/api

interface Settings {
  app_logo?: string;
  primary_color?: string;
}

interface SettingsContextData {
  settings: Settings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextData>({
  settings: {},
  loading: true,
  refreshSettings: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      // Assuming api handles the base URL correctly
      const response = await api.get('/settings');
      if (response.data && response.data.data) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching app settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
