import { userFetch } from "@/src/services/user.service";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
	AuthDataStorage,
	getStoredAuth,
	saveStoredAuth,
} from "./AsyncStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/src/interfaces/User";

type AuthContextType = {
	authStorage: AuthDataStorage;
	user: User | undefined;
	authenticate: (user: User, accessToken: string) => Promise<void>;
	continueAsGuest: (name: string, label: string, socialLink: string) => Promise<void>;
	logout: () => Promise<void>;
	updateUser: (updates: Partial<User>) => User | undefined;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [authStorage, setAuthStorage] = useState<AuthDataStorage>({
		userId: "",
		accessToken: "",
		isGuest: true,
	});

	const [user, setUser] = useState<User | undefined>(undefined);

	//load stored data on startup
	useEffect(() => {
		const load = async () => {
			const stored = await getStoredAuth();
			setAuthStorage(stored);
			if (stored.userId && stored.accessToken) {
				const importedUser = await userFetch(stored.userId, stored.accessToken);
				if (importedUser) {
					const mappedUser: User = {
						user_id: importedUser.user_id,
						name: importedUser.name,
						email: importedUser.email,
					};
					setUser(mappedUser);
				}
			}
			
		};

		load();
	}, []);

	const authenticate = async (user: User, accessToken: string) => {
		setUser(user);
		const storageData: AuthDataStorage = {
			userId: user?.user_id,
			accessToken,
			isGuest: false,
		};
		setAuthStorage(storageData);
		await saveStoredAuth(storageData);
	};

	const continueAsGuest = async (name: string, label: string, socialLink: string) => {
		const guestUser: User = {
			user_id: "guest-" + Date.now().toString(), //TODO: how to ID guests?
			name: name,
			socialLinks: [{label, url: socialLink}],
			isGuest: true,
		};

		setUser(guestUser);

		const storageData: AuthDataStorage = {
			userId: guestUser.user_id,
			accessToken: "",
			isGuest: true,
		};

		setAuthStorage(storageData);
		await saveStoredAuth(storageData);
	};

	const logout = async () => {
		setUser(undefined);
		setAuthStorage({ userId: "", accessToken: "", isGuest: true});
		await AsyncStorage.clear()
	};

	//Update in-memory user
	const updateUser = (updates: Partial<User>): User | undefined => {
		if (!user) return undefined;
		const newUser = { ...user, ...updates };
		setUser(newUser);
		return newUser;
	};

	return (
		<AuthContext.Provider
			value={{
				authStorage,
				user,
				authenticate,
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
