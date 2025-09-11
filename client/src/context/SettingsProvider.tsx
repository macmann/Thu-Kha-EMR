import React, { createContext, useContext, useEffect, useState } from 'react';
import { Doctor, listDoctors, createDoctor } from '../api/client';

interface UserAccount {
  email: string;
  password: string;
}

interface SettingsContextType {
  appName: string;
  logo: string | null;
  users: UserAccount[];
  doctors: Doctor[];
  updateSettings: (data: { appName?: string; logo?: string | null }) => void;
  addUser: (user: UserAccount) => void;
  addDoctor: (doctor: { name: string; department: string }) => Promise<void>;
  widgetEnabled: boolean;
  setWidgetEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appName, setAppName] = useState<string>('EMR System');
  const [logo, setLogo] = useState<string | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [widgetEnabled, setWidgetEnabled] = useState<boolean>(false);

  useEffect(() => {
    const stored = localStorage.getItem('appSettings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.appName) setAppName(parsed.appName);
        if (parsed.logo) setLogo(parsed.logo);
        if (Array.isArray(parsed.users)) setUsers(parsed.users);
        if (typeof parsed.widgetEnabled === 'boolean') setWidgetEnabled(parsed.widgetEnabled);
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    listDoctors().then(setDoctors).catch(() => setDoctors([]));
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'appSettings',
      JSON.stringify({ appName, logo, users, widgetEnabled }),
    );
  }, [appName, logo, users, widgetEnabled]);

  const updateSettings = (data: { appName?: string; logo?: string | null }) => {
    if (data.appName !== undefined) setAppName(data.appName);
    if (data.logo !== undefined) setLogo(data.logo);
  };

  const addUser = (user: UserAccount) => {
    setUsers((prev) => [...prev, user]);
  };

  const addDoctor = async (doctor: { name: string; department: string }) => {
    const created = await createDoctor(doctor);
    setDoctors((prev) => [...prev, created]);
  };

  return (
    <SettingsContext.Provider
      value={{
        appName,
        logo,
        users,
        doctors,
        updateSettings,
        addUser,
        addDoctor,
        widgetEnabled,
        setWidgetEnabled,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};

