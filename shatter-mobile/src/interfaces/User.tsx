type SocialLink = {
  label: string;
  url: string;
};

//internal user for mobile
export type User = {
	user_id: string;
	name?: string;
	email?: string;
	bio?: string;
	profilePhoto?: string;
	socialLinks?: SocialLink[]
	isGuest?: boolean;
};

export enum UserType{
    Networker = "networker",
    Organizer = "organizer"
}
