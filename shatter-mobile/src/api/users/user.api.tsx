import { GameType } from "@/src/interfaces/Event";
import UserConnectionsRequest from "@/src/interfaces/requests/GetUserConnectionsRequest";
import UserLoginRequest from "@/src/interfaces/requests/UserLoginRequest";
import UserSignupRequest from "@/src/interfaces/requests/UserSignupRequest";
import UserConnectionsResponse from "@/src/interfaces/responses/GetUserConnectionsResponse";
import UserDataResponse from "@/src/interfaces/responses/GetUserDataResponse";
import GetUserEventsResponse from "@/src/interfaces/responses/GetUserEventsResponse";
import UserInfoUpdateResponse from "@/src/interfaces/responses/UpdateUserInfoResponse";
import UserLoginResponse from "@/src/interfaces/responses/UserLoginResponse";
import UserSignupResponse from "@/src/interfaces/responses/UserSignupResponse";
import { User } from "@/src/interfaces/User";
import axios, { AxiosError, type AxiosResponse } from "axios";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;
const API_BASE_URL_AUTH = `${API_BASE}/api/auth`;
const API_BASE_URL_USER = `${API_BASE}/api/users`;

export async function UserLoginApi(
	email: string,
	password: string,
): Promise<UserLoginResponse> {
	try {
		const body: UserLoginRequest = { email, password };
		const response: AxiosResponse<UserLoginResponse> = await axios.post(
			`${API_BASE_URL_AUTH}/login`,
			body,
		);
		return response.data;
	} catch (error) {
		const err = error as AxiosError;

		if (err.response) {
			switch (err.response.status) {
				case 401:
					throw new Error("Invalid email or password.");
				case 404:
					throw new Error("User not found.");
				case 500:
					throw new Error("Server error. Please try again later.");
				default:
					throw new Error("Login failed.");
			}
		}

		throw new Error("Network error. Check your connection.");
	}
}

export async function UserSignupApi(
	name: string,
	email: string,
	password: string,
): Promise<UserSignupResponse> {
	try {
		const body: UserSignupRequest = { name, email, password };
		const response: AxiosResponse<UserLoginResponse> = await axios.post(
			`${API_BASE_URL_AUTH}/signup`,
			body,
		);
		return response.data;
	} catch (error) {
		const err = error as AxiosError;

		if (err.response) {
			switch (err.response.status) {
				case 409:
					throw new Error("An account with this email already exists.");
				case 400:
					throw new Error("Invalid signup data.");
				case 500:
					throw new Error("Server error. Please try again later.");
				default:
					throw new Error("Signup failed.");
			}
		}

		throw new Error("Network error. Check your connection.");
	}
}

export async function UserFetchApi(
	userId: string,
	token: string,
): Promise<UserDataResponse> {
	try {
		const response: AxiosResponse<UserDataResponse> = await axios.get(
			`${API_BASE_URL_USER}/${userId}`,
			{ headers: { Authorization: `Bearer ${token}` } },
		);
		return response.data;
	} catch (error) {
		const err = error as AxiosError;

		if (err.response) {
			switch (err.response.status) {
				case 404:
					throw new Error("This user doesn't exist.");
				case 400:
					throw new Error("Missing info from this user.");
				case 500:
					throw new Error("Server error. Please try again later.");
				default:
					throw new Error("This user cannot be collected at this time.");
			}
		}

		throw new Error("Network error. Check your connection.");
	}
}

export async function GetUserEventsApi(
	userId: string,
	token: string,
): Promise<GetUserEventsResponse> {
	try {
		const response: AxiosResponse<GetUserEventsResponse> = await axios.get(
			`${API_BASE_URL_USER}/${userId}/events`,
			{ headers: { Authorization: `Bearer ${token}` } },
		);
		return response.data;
	} catch (error) {
		const err = error as AxiosError;

		if (err.response) {
			switch (err.response.status) {
				case 404:
					throw new Error("That user cannot be found. Please try again later.");
				case 400:
					throw new Error("That user cannot be found. Please try again later.");
				case 500:
					throw new Error("Server error. Please try again later.");
				default:
					throw new Error(
						"Events cannot be loaded right now. Please try again later.",
					);
			}
		}

		throw new Error("Network error. Check your connection.");
	}
}

export async function UserConnectionsApi(
	userId: string,
	eventId: string,
	token: string,
): Promise<UserConnectionsResponse> {
	try {
		const body: UserConnectionsRequest = { userId, eventId };
		const response: AxiosResponse<UserConnectionsResponse> = await axios.post(
			`${API_BASE_URL_USER}/blah`,
			body,
			{ headers: { Authorization: `Bearer ${token}` } },
		);
		return response.data;
	} catch (error) {
		const err = error as AxiosError;

		if (err.response) {
			switch (err.response.status) {
				case 400:
					throw new Error("Invalid connection data.");
				case 500:
					throw new Error("Server error. Please try again later.");
				default:
					throw new Error("Connection failed.");
			}
		}

		throw new Error("Network error. Check your connection.");
	}
}

export async function UserUpdateApi(
	userId: string,
	updates: Partial<User>,
	token: string,
): Promise<UserInfoUpdateResponse> {
	try {
		const body = {
			name: updates.name,
			email: updates.email,
			bio: updates.bio,
			profilePhoto: updates.profilePhoto,
			socialLinks: updates.socialLinks,
		};

		const response: AxiosResponse<UserInfoUpdateResponse> = await axios.put(
			`${API_BASE_URL_USER}/${userId}`,
			body,
			{ headers: { Authorization: `Bearer ${token}` } },
		);
		return response.data;
	} catch (error) {
		const err = error as AxiosError;

		if (err.response) {
			switch (err.response.status) {
				case 403:
					throw new Error(
						"You can only update your own profile. Please re-login and try again.",
					);
				case 400:
					throw new Error(
						"Invalid information entered. Please adjust your info and try again.",
					);
				case 404:
					throw new Error("User not found. Please try again later.");
				case 409:
					throw new Error("That email is already in use.");
				case 500:
					throw new Error("Server error. Please try again later.");
				default:
					throw new Error("Info update failed.");
			}
		}

		throw new Error("Network error. Check your connection.");
	}
}
