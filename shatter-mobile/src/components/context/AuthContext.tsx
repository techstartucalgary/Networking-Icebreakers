import { SocialLink, User } from "@/src/interfaces/User";
import { userFetch } from "@/src/services/user.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthDataStorage, getStoredAuth, saveStoredAuth } from "./AsyncStorage";

type AuthContextType = {
	authStorage: AuthDataStorage;
	user: User | undefined;
	authenticate: (
		user: User,
		accessToken: string,
		isGuest: boolean,
	) => Promise<void>;
	continueAsGuest: (name: string, socialLink: SocialLink) => Promise<void>;
	logout: () => Promise<void>;
	updateUser: (updates: Partial<User>) => User | undefined;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [authStorage, setAuthStorage] = useState<AuthDataStorage>({
		userId: "",
		accessToken: "",
		isGuest: true,
		guestInfo: { name: "", socialLinks: [] },
	});

	const [user, setUser] = useState<User | undefined>(undefined);

	//load stored data on startup
	useEffect(() => {
		const load = async () => {
			const stored = await getStoredAuth();
			setAuthStorage(stored);
			if (!stored.isGuest && stored.userId && stored.accessToken) {
				//user is logged in, fetch most current data
				const res = await userFetch(stored.userId, stored.accessToken);
				if (res) {
					const mappedUser: User = {
						user_id: res.user.user_id,
						name: res.user.name,
						email: res.user.email,
						isGuest: res.user.isGuest,
						socialLinks: res.user.socialLinks,
					};
					setUser(mappedUser);
				}
			} else {
				//user is guest, fetch last saved in local
				const savedData = await getStoredAuth();
				if (savedData) {
					const mappedUser: User = {
						user_id: savedData.userId,
						name: savedData.guestInfo.name,
						email: "",
						isGuest: savedData.isGuest,
						socialLinks: savedData.guestInfo.socialLinks,
					};
					setUser(mappedUser);
				}
			}
		};

		load();
	}, []);

	const authenticate = async (
		user: User,
		accessToken: string,
		isGuest: boolean,
	) => {
		setUser(user);
		const storageData: AuthDataStorage = {
			userId: user?.user_id,
			accessToken,
			isGuest: isGuest,
			guestInfo: { name: user.name, socialLinks: user.socialLinks },
		};
		setAuthStorage(storageData);
		await saveStoredAuth(storageData);
	};

	const continueAsGuest = async (name: string, socialLink: SocialLink) => {
		const guestUser: User = {
			user_id: "GUEST",
			name: name,
			socialLinks: [{ label: socialLink.label, url: socialLink.url }],
			isGuest: true,
		};

		setUser(guestUser);

		const storageData: AuthDataStorage = {
			userId: guestUser.user_id,
			accessToken: "",
			isGuest: true,
			guestInfo: { name: guestUser.name, socialLinks: guestUser.socialLinks },
		};

		setAuthStorage(storageData);
		await saveStoredAuth(storageData);
	};

	const logout = async () => {
		setUser(undefined);
		setAuthStorage({
			userId: "",
			accessToken: "",
			isGuest: true,
			guestInfo: { name: "", socialLinks: [] },
		});
		await AsyncStorage.clear();
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
