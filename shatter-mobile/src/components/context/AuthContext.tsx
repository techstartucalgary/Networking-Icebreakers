import React, { createContext, useContext, useState, useEffect } from "react";
import { getStoredAuth, saveStoredAuth, clearStoredAuth, AuthDataStorage  } from "../general/AsyncStorage";

export type User = {
  user_id: string;
  name: string;
  email: string;
  linkedin: string;
  github: string;
} | null;

type AuthContextType = {
  authStorage: AuthDataStorage;  //minimal persisted data (userId, accessToken, expiry)
  user: User;                     //full profile in memory
  login: (user: User, accessToken: string, expiry: number) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void; //in-memory only
};


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authStorage, setAuthStorage] = useState<AuthDataStorage>({
    userId: null,
    accessToken: null,
    expiry: null,
  });

  const [user, setUser] = useState<User>(null);

  //load stored data on app startup
  useEffect(() => {
    const load = async () => {
      const stored = await getStoredAuth();
      setAuthStorage(stored);
      //TODO: Load full profile from backend, applies for app restart
    };
    load();
  }, []);

  //login (store in context and AsyncStorage)
  const login = async (user: User, accessToken: string, expiry: number) => {
    setUser(user);
    const storageData: AuthDataStorage = {
      userId: user?.user_id || "",
      accessToken,
      expiry,
    };
    setAuthStorage(storageData);
    await saveStoredAuth(storageData);
  };

  //logout (clear storage and context)
  const logout = async () => {
    setUser(null);
    setAuthStorage({ userId: null, accessToken: null, expiry: null });
    await clearStoredAuth();
  };

  //update user with new info, keeps auth up to date with new changes
  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider value={{ authStorage, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};