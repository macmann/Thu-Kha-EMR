import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAccessToken, setAccessToken, subscribeAccessToken } from '../api/http';
import { login as apiLogin, type Tokens } from '../api/client';

interface User {
  userId: string;
  role: string;
  email: string;
}

interface AuthContextType {
  accessToken: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(
    getAccessToken(),
  );
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeAccessToken(setAccessTokenState);
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const data: Tokens = await apiLogin(email, password);
    setAccessToken(data.accessToken);
    const payload: { sub: string; role: string } = JSON.parse(
      atob(data.accessToken.split('.')[1]),
    );
    setUser({ userId: payload.sub, role: payload.role, email });
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
