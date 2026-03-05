import { Connection } from "../User";

//return connections of a user for an event
export default interface UserConnectionsResponse {
	connections: Connection[];
}
