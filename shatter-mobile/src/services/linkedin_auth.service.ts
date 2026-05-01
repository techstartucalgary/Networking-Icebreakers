import * as WebBrowser from "expo-web-browser";
import { User } from "../interfaces/User";
import { exchangeLinkedInCode, userFetch } from "./user.service";

const REDIRECT_SCHEME = "shattermobile://auth";

export async function loginWithLinkedIn(): Promise<
	{ user: User; token: string } | null
> {
	const result = await WebBrowser.openAuthSessionAsync(
		`${process.env.EXPO_PUBLIC_API_BASE}/api/auth/linkedin?platform=mobile`,
		REDIRECT_SCHEME,
	);

	if (result.type !== "success") return null;

	const url = new URL(result.url);
	const errorMessage = url.searchParams.get("message");
	if (errorMessage) throw new Error(errorMessage);

	const code = url.searchParams.get("code");
	if (!code) return null;

	const { userId, token } = await exchangeLinkedInCode(code);
	const userData = await userFetch(userId, token);

	const user: User = {
		_id: userId,
		name: userData.user.name,
		email: userData.user.email,
		socialLinks: userData.user.socialLinks ?? {},
		profilePhoto: userData.user.profilePhoto,
		organization: userData.user.organization,
		title: userData.user.title,
		isGuest: false,
	};

	return { user, token };
}
