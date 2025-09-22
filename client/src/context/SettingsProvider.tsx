import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createDoctor,
  createUserAccount,
  listDoctors,
  listUsers,
  updateUserAccount,
  type CreateUserPayload,
  type Doctor,
  type UpdateUserPayload,
  type UserAccount,
} from '../api/client';

interface SettingsContextType {
  appName: string;
  logo: string | null;
  users: UserAccount[];
  doctors: Doctor[];
  updateSettings: (data: { appName?: string; logo?: string | null }) => void;
  addUser: (user: CreateUserPayload) => Promise<UserAccount>;
  updateUser: (id: string, data: UpdateUserPayload) => Promise<UserAccount>;
  addDoctor: (doctor: { name: string; department: string }) => Promise<Doctor>;
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
    listUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'appSettings',
      JSON.stringify({ appName, logo, widgetEnabled }),
    );
  }, [appName, logo, widgetEnabled]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = appName || 'EMR System';
    }
  }, [appName]);

  const updateSettings = (data: { appName?: string; logo?: string | null }) => {
    if (data.appName !== undefined) setAppName(data.appName);
    if (data.logo !== undefined) setLogo(data.logo);
  };

  const addUser = async (user: CreateUserPayload) => {
    const created = await createUserAccount(user);
    setUsers((prev) => [...prev, created].sort((a, b) => a.email.localeCompare(b.email)));
    return created;
  };

  const updateUser = async (id: string, data: UpdateUserPayload) => {
    const updated = await updateUserAccount(id, data);
    setUsers((prev) =>
      prev
        .map((item) => (item.userId === id ? updated : item))
        .sort((a, b) => a.email.localeCompare(b.email)),
    );
    return updated;
  };

  const addDoctor = async (doctor: { name: string; department: string }) => {
    const created = await createDoctor(doctor);
    setDoctors((prev) => [...prev, created]);
    return created;
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
        updateUser,
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

