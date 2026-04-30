import { SocialLinks } from "../User"

export default interface EventJoinIdGuestRequest {
    name: string
    socialLinks: SocialLinks
    organization: string,
}