import {
    UserFetchApi,
    UserLoginApi,
    UserSignupApi,
	UserUpdateApi,
	UserConnectionsApi,
} from "../api/users/user.api";
import UserLoginResponse from "../interfaces/responses/UserLoginResponse";
import UserSignupResponse from "../interfaces/responses/UserSignupResponse";
import UserConnectionsResponse from "../interfaces/responses/GetUserConnectionsResponse";
import { User } from "../interfaces/User";

export async function userLogin(
  email: string,
  password: string,
): Promise<UserLoginResponse> {
  return await UserLoginApi(email, password);
}

export async function userSignup(
	name: string,
	email: string,
	password: string,
): Promise<UserSignupResponse> {
	return await UserSignupApi(name, email, password);
}

export async function userFetch(
	userId: string,
	token: string,
): Promise<User | undefined> {
	const res = await UserFetchApi(userId, token);
	if (!res || !res.success) return undefined;
	return res.user;
}

export async function fetchConnections(
	userId: string,
	eventId: string,
	token: string,
): Promise<UserConnectionsResponse | undefined> {
	const res = await UserConnectionsApi(userId, eventId, token);
	if (!res || !res.success) return {success: false, connections: []};
	return {success: true, connections: res.connections};
}

export async function userUpdate(
	userId: string,
	updates: Partial<User>,
	token: string
): Promise<User | undefined> {
	const res = await UserUpdateApi(userId, updates, token);
	if (!res || !res.success) return undefined;
	return res.user;
}
