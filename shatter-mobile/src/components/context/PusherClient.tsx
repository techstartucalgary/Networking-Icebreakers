import { Pusher } from "@pusher/pusher-websocket-react-native";

let pusher: Pusher | null = null;
let initPromise: Promise<Pusher> | null = null;

const API_KEY = process.env.PUSHER_KEY!;
const API_CLUSTER = process.env.PUSHER_CLUSTER!;

export const getPusherClient = async (): Promise<Pusher> => {
	if (pusher) return pusher;

	if (!initPromise) {
		initPromise = (async () => {
			const instance = Pusher.getInstance();

			await instance.init({
				apiKey: API_KEY,
				cluster: API_CLUSTER,
			});

			await instance.connect();

			pusher = instance;
			return pusher;
		})();
	}

	return initPromise;
};
