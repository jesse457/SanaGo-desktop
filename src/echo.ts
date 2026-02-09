import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: any;
  }
}
// 2. Extract Environment Variables
const host = import.meta.env.VITE_REVERB_HOST;
const port = import.meta.env.VITE_REVERB_PORT;
const scheme = import.meta.env.VITE_REVERB_SCHEME;
const key = import.meta.env.VITE_REVERB_APP_KEY;
const baseUrl = import.meta.env.VITE_BASE_URL;
export let currentState: boolean = false;
window.Pusher = Pusher;
const listeners = new Set<(state: boolean) => void>();
export function subscribeToConnection(
  callBack: (state: boolean) => void,
): () => void {
  listeners.add(callBack);
  callBack(currentState);
  return () => {
    listeners.delete(callBack);
  };
}
function notify(state: boolean) {
  currentState = state;
  listeners.forEach((cb) => cb(state));
}
export const setupEcho = (token: string) => {
  // 1. Clean up existing connections
  if (window.Echo) {
    window.Echo.disconnect();
  }

  try {
    window.Echo = new Echo({
      broadcaster: "reverb",
      key: key,
      wsHost: host,
      wsPort: port ?? 80,
      wssPort: port ?? 443,
      forceTLS: scheme === "https",
      enabledTransports: ["ws", "wss"],
      // In Prod: https://sanago.site/api/broadcasting/auth
      // In Dev: http://localhost:8000/api/broadcasting/auth
      authEndpoint: `${baseUrl}/api/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    });
console.log(token)
    console.log(`[Echo] Initialized on ${scheme}://${host}:${port}`);

    // Connection Event Listeners
    const connection = window.Echo.connector.pusher.connection;

    connection.bind("connected", () => {
      console.log(
        "%c[WebSocket] Connected",
        "color: #10b981; font-weight: bold;",
      );
      notify(true);
    });

    connection.bind("error", (error: any) => {
      console.error(
        "%c[WebSocket] Connection Error:",
        "color: #ef4444; font-weight: bold;",
        error,
      );
         notify(false);
    });

    connection.bind("disconnected", () => {
      console.warn("[WebSocket] Disconnected");
      notify(false);
    });

    // Useful for debugging auth issues
    connection.bind("state_change", (states: any) => {
      console.debug("[WebSocket] State:", states.current);
    });
  } catch (error) {
    console.error("Failed to initialize Echo:", error);
  }
};

export const publicSocket = () => {
  try {
    window.Echo = new Echo({
      broadcaster: "reverb",
      key: key,
      wsHost: host,
      wsPort: port ?? 80,
      wssPort: port ?? 443,
      forceTLS: scheme === "https",
      enabledTransports: ["ws", "wss"],
    });

    // Connection Event Listeners
    const connection = window.Echo.connector.pusher.connection;

    connection.bind("connected", () => {
      console.log(
        "Public %c[WebSocket] Connected",
        "color: #10b981; font-weight: bold;",
      );
      notify(true);
    });

    connection.bind("error", (error: any) => {
      console.error(
        "Public %c[WebSocket] Connection Error:",
        "color: #ef4444; font-weight: bold;",
        error,
      );
         notify(false);
    });

    connection.bind("disconnected", () => {
      console.warn("Public [WebSocket] Disconnected");
      notify(false);
    });

    // Useful for debugging auth issues
    connection.bind("state_change", (states: any) => {
      console.debug("[WebSocket] State:", states.current);
    });
  } catch (error) {
    console.error("Failed to initialize public Echo:", error);
  }
};
