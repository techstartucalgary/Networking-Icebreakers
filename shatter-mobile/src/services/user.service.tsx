import {
	CreateUserConnectionsApi,
	GetParticipantApi,
	GetUserConnectionsApi,
	UserFetchApi,
	UserLoginApi,
	UserSignupApi,
	UserUpdateApi,
} from "../api/users/user.api";
import CreateUserConnectionResponse from "../interfaces/responses/CreateUserConnectionResponse";
import { ConnectedUser } from "../interfaces/responses/GetParticipantInfoResponse";
import { UserConnectionsResponse } from "../interfaces/responses/GetUserConnectionsResponse";
import UserDataResponse from "../interfaces/responses/GetUserDataResponse";
import UserInfoUpdateResponse from "../interfaces/responses/UpdateUserInfoResponse";
import UserLoginResponse from "../interfaces/responses/UserLoginResponse";
import UserSignupResponse from "../interfaces/responses/UserSignupResponse";
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
): Promise<UserDataResponse> {
	return await UserFetchApi(userId, token);
}

export async function fetchConnections(
	participantId: string,
	eventId: string,
	token: string,
): Promise<UserConnectionsResponse> {
	return await GetUserConnectionsApi(participantId, eventId, token);
}

export async function participantFetch(
	participantId: string,
	eventId: string,
	token: string,
): Promise<ConnectedUser[]> {
	return await GetParticipantApi(participantId, eventId, token);
}

export async function createConnection(
	eventId: string,
	primaryParticipantId: string,
	secondaryParticipantId: string,
	token: string,
	description?: string | null,
): Promise<CreateUserConnectionResponse> {
	return await CreateUserConnectionsApi(
		eventId,
		primaryParticipantId,
		secondaryParticipantId,
		token,
		description,
	);
}

export async function userUpdate(
	userId: string,
	updates: Partial<User>,
	token: string,
): Promise<UserInfoUpdateResponse> {
	return await UserUpdateApi(userId, updates, token);
}
