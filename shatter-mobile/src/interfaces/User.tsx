export interface User {
    userId: String,
    name: String,
    email: String,
    password: String,
    profilePicture: String,
    bio: String,
    socialLinks: String,
    userType: UserType
}

export enum UserType{
    Networker = "networker",
    Organizer = "organizer"
}
