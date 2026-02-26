export type SocialLink = {
  label: string;
  url: string;
};

//internal user for mobile
export type User = {
	user_id: string | null; //null for guest users that haven't joined event before
	name: string;
	email?: string;
	password?: string
	bio?: string;
	profilePhoto?: string;
	socialLinks: SocialLink[]
	isGuest: boolean;
};

export enum UserType{
    Networker = "networker",
    Organizer = "organizer"
}
