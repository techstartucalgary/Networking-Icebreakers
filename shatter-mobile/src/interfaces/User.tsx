export interface User {
    userId: string,
    name: string,
    email: string,
    password: string,
    profilePicture: string,
    bio: string,
    socialLinks: string,
    userType: UserType
}

export enum UserType{
    Networker = "networker",
    Organizer = "organizer"
}
