import Echo from "laravel-echo";
import Pusher from "pusher-js";
import getLocal from "@/plugins/local";

if (typeof window !== "undefined") {
  window.Pusher = Pusher;
}

let echoInstance = null;

function getEcho() {
  if (typeof window === "undefined") return null;
  if (!import.meta.env.VITE_PUSHER_APP_KEY) return null;
  if (!echoInstance) {
    const token = getLocal()?.token ?? "";
    echoInstance = new Echo({
      broadcaster: "pusher",
      key: import.meta.env.VITE_PUSHER_APP_KEY ?? "",
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? "ap1",
      forceTLS: (import.meta.env.VITE_PUSHER_APP_USE_TLS ?? "true") === "true",
      authEndpoint: import.meta.env.VITE_BROADCAST_AUTH_ENDPOINT ?? "",
      auth: {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      },
      ...(import.meta.env.VITE_PUSHER_APP_HOST && {
        wsHost: import.meta.env.VITE_PUSHER_APP_HOST,
        wssPort: 443,
        disableStats: true,
      }),
    });
  }
  return echoInstance;
}

/**
 * Reset Echo instance (e.g. after logout/login to use new token).
 * Next use of echo will create a new instance with fresh token from localStorage.
 */
export function resetEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}

const echoProxy =
  typeof window !== "undefined"
    ? new Proxy(
        {},
        {
          get(_, prop) {
            const instance = getEcho();
            const value = instance?.[prop];
            if (typeof value === "function")
              return value.bind(instance);

            return value;
          },
        },
      )
    : null;

export const echo = echoProxy;

export default function (app) {
  app.config.globalProperties.$echo = echoProxy;
}
