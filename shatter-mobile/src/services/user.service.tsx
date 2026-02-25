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
import GetUserDataResponse from "../interfaces/responses/GetUserDataResponse";
import UserInfoUpdateResponse from "../interfaces/responses/UpdateUserInfoResponse";

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
): Promise<GetUserDataResponse> {
	return await UserFetchApi(userId, token);
}

export async function fetchConnections(
	userId: string,
	eventId: string,
	token: string,
): Promise<UserConnectionsResponse> {
	return await UserConnectionsApi(userId, eventId, token);
}

export async function userUpdate(
	userId: string,
	updates: Partial<User>,
	token: string
): Promise<UserInfoUpdateResponse> {
	return await UserUpdateApi(userId, updates, token);
}
