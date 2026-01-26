import {
    UserFetchApi,
    UserLoginApi,
    UserSignupApi,
} from "../api/users/user.api";
import UserLoginResponse from "../interfaces/responses/UserLoginResponse";
import UserSignupResponse from "../interfaces/responses/UserSignupResponse";
import { User } from "../interfaces/User";

export async function userLogin(
	email: string,
	password: string,
): Promise<UserLoginResponse | undefined> {
	const userInfo = await UserLoginApi(email, password);
	return userInfo;
}

export async function userSignup(
	name: string,
	email: string,
	password: string,
): Promise<UserSignupResponse | undefined> {
	const userInfo = await UserSignupApi(name, email, password);
	return userInfo;
}

export async function userFetch(
	userId: string,
	token: string,
): Promise<User | undefined> {
	const res = await UserFetchApi(userId, token);
	if (!res || !res.success) return undefined;
	return res.user;
}
