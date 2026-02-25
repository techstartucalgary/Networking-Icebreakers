export interface User {
    userId: string,
    name: string,
    email: string,
    password: string,
    profilePhoto: string,
    bio: string,
    socialLinks: {
        label: string;
        url: string;
    }[],
    userType: UserType
}

export enum UserType{
    Networker = "networker",
    Organizer = "organizer"
}
