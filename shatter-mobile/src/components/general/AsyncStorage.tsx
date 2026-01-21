import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'AUTH_DATA';

export type AuthDataStorage = {
  userId: string | null;
  accessToken: string;
};

export const getStoredAuth = async (): Promise<AuthDataStorage> => {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json
    ? JSON.parse(json)
    : { userId: null, accessToken: "" };
};

export const saveStoredAuth = async (data: Partial<AuthDataStorage>) => {
  const existing = await getStoredAuth();
  const merged = { ...existing, ...data };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
};

export const clearStoredAuth = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};