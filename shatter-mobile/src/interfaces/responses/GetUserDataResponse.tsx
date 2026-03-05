import { User } from "../User";

//return a user with stored data
export default interface UserDataResponse {
	success: boolean;
	user: User;
}
