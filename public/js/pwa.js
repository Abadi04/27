import { db } from "./db.js";
import { state } from "./state.js";
import { VAPID_PUBLIC_KEY } from "./config.js";
import { getAppBasePath, urlBase64ToUint8Array } from "./utils.js";

export async function registerPwa() {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

  if (Notification.permission === "default") {
    try { await Notification.requestPermission(); }
    catch (e) { console.warn(e); }
  }
  if (Notification.permission !== "granted") return;

  try {
    const registration = await navigator.serviceWorker.register(`${getAppBasePath()}sw.js`);

    if (VAPID_PUBLIC_KEY && state.currentProfile?.id && db && registration.pushManager) {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      await db.from("push_subscriptions").upsert(
        {
          user_id: state.currentProfile.id,
          endpoint: subscription.endpoint,
          subscription: subscription.toJSON(),
        },
        { onConflict: "endpoint" }
      );
    }
  } catch (error) {
    console.warn(error);
  }
}
