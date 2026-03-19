import { User } from "../User";

//when connections require participant data tied to user data
export interface ConnectedUser {
  participantId: string;
  participantName: string;
  connectionDescription: string | null;
  user: User | null;
}