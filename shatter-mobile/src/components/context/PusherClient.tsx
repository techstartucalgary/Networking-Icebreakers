const { Pusher } = require('pusher-js/react-native');

let pusher: any = null;

const API_KEY = process.env.EXPO_PUBLIC_PUSHER_KEY!;
const API_CLUSTER = process.env.EXPO_PUBLIC_PUSHER_CLUSTER!;

export const getPusherClient = () => {
  if (pusher) return pusher;

  pusher = new Pusher(API_KEY, {
    cluster: API_CLUSTER,
  });

  return pusher;
};