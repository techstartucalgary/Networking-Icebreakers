export type SocialLinks = {
  linkedin?: string;
  github?: string;
  other?: OtherLink[];
};

export type OtherLink = {
	label: string,
	url: string,
}

export type Connection = {
	_id: string;
	_eventId: string;
	primaryParticipantId: string;
	secondaryParticipantId: string;
	description: string;
};

//internal user for mobile
export type User = {
	_id: string | null; //null for guest users that haven't joined event before
	name: string;
	email?: string;
	password?: string;
	bio?: string;
	profilePhoto?: string;
	socialLinks?: SocialLinks;
	title?: string;
	organization?: string;
	isGuest: boolean;
};
