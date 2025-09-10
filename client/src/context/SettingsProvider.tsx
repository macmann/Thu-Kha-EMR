import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserAccount {
  email: string;
  password: string;
}

interface SettingsContextType {
  appName: string;
  logo: string | null;
  users: UserAccount[];
  updateSettings: (data: { appName?: string; logo?: string | null }) => void;
  addUser: (user: UserAccount) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appName, setAppName] = useState<string>('EMR System');
  const [logo, setLogo] = useState<string | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('appSettings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.appName) setAppName(parsed.appName);
        if (parsed.logo) setLogo(parsed.logo);
        if (Array.isArray(parsed.users)) setUsers(parsed.users);
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify({ appName, logo, users }));
  }, [appName, logo, users]);

  const updateSettings = (data: { appName?: string; logo?: string | null }) => {
    if (data.appName !== undefined) setAppName(data.appName);
    if (data.logo !== undefined) setLogo(data.logo);
  };

  const addUser = (user: UserAccount) => {
    setUsers((prev) => [...prev, user]);
  };

  return (
    <SettingsContext.Provider value={{ appName, logo, users, updateSettings, addUser }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};

