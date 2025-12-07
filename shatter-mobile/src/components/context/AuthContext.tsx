import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthDataStorage, clearStoredAuth, getStoredAuth, saveStoredAuth } from "../general/AsyncStorage";

export type User = {
  user_id: string;
  name?: string;
  email?: string;
  linkedin?: string;
  github?: string;
  isGuest?: boolean;
} | null;

type AuthContextType = {
  authStorage: AuthDataStorage;
  user: User;
  login: (user: User, accessToken: string, expiry: number) => Promise<void>;
  continueAsGuest: (name: string, linkedin: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authStorage, setAuthStorage] = useState<AuthDataStorage>({
    userId: null,
    accessToken: null,
    expiry: null,
  });

  const [user, setUser] = useState<User>(null);

  //load stored data on startup
  useEffect(() => {
    const load = async () => {
      const stored = await getStoredAuth();
      setAuthStorage(stored);
      //TODO: Pull full profile from backend using stored.userId
    };

    load();
  }, []);

  const login = async (user: User, accessToken: string, expiry: number) => {
    setUser(user);
    const storageData: AuthDataStorage = {
      userId: user?.user_id || null,
      accessToken,
      expiry,
    };
    setAuthStorage(storageData);
    await saveStoredAuth(storageData);
  };

  const continueAsGuest = async (name: string, linkedin: string) => {
    const guestUser: User = {
      user_id: "guest-" + Date.now().toString(), //how to ID guests?
      name: name,
      linkedin: linkedin,
      isGuest: true,
    };

    setUser(guestUser);

    const storageData: AuthDataStorage = {
      userId: guestUser.user_id,
      accessToken: null,
      expiry: null,
    };

    setAuthStorage(storageData);
    await saveStoredAuth(storageData);
  };

  const logout = async () => {
    setUser(null);
    setAuthStorage({ userId: null, accessToken: null, expiry: null });
    await clearStoredAuth();
  };

  //Upuate in-memory user
  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider
      value={{
        authStorage,
        user,
        login,
        continueAsGuest,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};