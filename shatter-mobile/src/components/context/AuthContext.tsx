import { SocialLinks, User } from "@/src/interfaces/User";
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
	continueAsGuest: (
		name: string,
		socialLinks: SocialLinks,
		organization: string,
	) => Promise<void>;
	logout: () => Promise<void>;
	updateUser: (updates: Partial<User>) => User | undefined;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [authStorage, setAuthStorage] = useState<AuthDataStorage>({
		userId: "",
		accessToken: "",
		isGuest: true,
		guestInfo: { name: "", socialLinks: {}, organization: "" },
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
						_id: res.user._id,
						name: res.user.name,
						email: res.user.email,
						isGuest: res.user.isGuest,
						socialLinks: res.user.socialLinks,
						organization: res.user.organization,
						title: res.user.title,
						profilePhoto: res.user.profilePhoto,
					};

					setUser(mappedUser);
				}
			} else {
				//user is guest, fetch last saved in local
				const savedData = await getStoredAuth();
				if (savedData) {
					const mappedUser: User = {
						_id: savedData.userId,
						name: savedData.guestInfo.name,
						email: "",
						isGuest: savedData.isGuest,
						socialLinks: savedData.guestInfo.socialLinks,
						organization: savedData.guestInfo.organization,
					};
					setUser(mappedUser);
				}
			}
		};

		load();
	}, []);

	//when user or guest joins an event, store for app refresh
	const authenticate = async (
		user: User,
		accessToken: string,
		isGuest: boolean,
	) => {
		setUser(user);
		const storageData: AuthDataStorage = {
			userId: user?._id,
			accessToken,
			isGuest: isGuest,
			guestInfo: {
				name: user.name,
				socialLinks: user.socialLinks || {},
				organization: user.organization,
			},
		};
		setAuthStorage(storageData);
		await saveStoredAuth(storageData);
	};

	//when user initially creates a guest account
	const continueAsGuest = async (
		name: string,
		socialLink: SocialLinks,
		organization: string,
	) => {
		const encodedName = encodeURIComponent(name ?? "Unknown");
		const profilePhoto = `https://api.dicebear.com/9.x/initials/svg?seed=${encodedName}`;

		const guestUser: User = {
			_id: null,
			name: name,
			socialLinks: { linkedin: socialLink.linkedin, github: socialLink.github, other: socialLink.other },
			organization: organization,
			profilePhoto: profilePhoto,
			isGuest: true,
		};

		setUser(guestUser);

		const storageData: AuthDataStorage = {
			userId: guestUser._id,
			accessToken: "",
			isGuest: true,
			guestInfo: {
				name: name,
				socialLinks: guestUser.socialLinks || {},
				organization: organization || "",
			},
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
			guestInfo: { name: "", socialLinks: {}, organization: "" },
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
