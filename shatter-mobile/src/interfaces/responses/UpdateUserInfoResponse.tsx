import { User } from "../User";

//returns new user info when updated
export default interface UserInfoUpdateResponse {
    success: boolean,
    user: User
}