import {
  deletePushSubscription,
  savePushSubscription,
} from "@/services/pushSubscriptions.service";

const VAPID_PUBLIC_KEY =
  import.meta.env.VITE_VAPID_PUBLIC_KEY as
    | string
    | undefined;

/* ============================================================================
   BASE64 → UINT8ARRAY
============================================================================ */

const urlBase64ToUint8Array = (
  base64String: string
): Uint8Array => {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4
  );

  const base64 =
    `${base64String}${padding}`
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData = window.atob(base64);

  const bytes = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index++) {
    bytes[index] = rawData.charCodeAt(index);
  }

  return bytes;
};

/* ============================================================================
   SUPPORT
============================================================================ */

export const isPushNotificationSupported =
  (): boolean => {
    return (
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    );
  };

/* ============================================================================
   PERMISSION
============================================================================ */

export const requestNotificationPermission =
  async (): Promise<NotificationPermission> => {
    if (
      !isPushNotificationSupported()
    ) {
      return "denied";
    }

    if (
      Notification.permission ===
      "granted"
    ) {
      return "granted";
    }

    return Notification.requestPermission();
  };

/* ============================================================================
   SUBSCRIPTION
============================================================================ */

export const subscribeToPushNotifications =
  async (): Promise<
    PushSubscription | null
  > => {
    if (
      !isPushNotificationSupported()
    ) {
      return null;
    }

    if (!VAPID_PUBLIC_KEY) {
      throw new Error(
        "VITE_VAPID_PUBLIC_KEY est manquante."
      );
    }

    if (
      Notification.permission !==
      "granted"
    ) {
      return null;
    }

    const registration =
      await navigator.serviceWorker.ready;

    let subscription =
      await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription =
        await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey:
            urlBase64ToUint8Array(
              VAPID_PUBLIC_KEY
            ),
        });
    }

    await savePushSubscription(
      subscription
    );

    return subscription;
  };

/* ============================================================================
   UNSUBSCRIBE
============================================================================ */

export const unsubscribeFromPushNotifications =
  async (): Promise<boolean> => {
    if (
      !isPushNotificationSupported()
    ) {
      return false;
    }

    const registration =
      await navigator.serviceWorker.ready;

    const subscription =
      await registration.pushManager.getSubscription();

    if (!subscription) {
      return true;
    }

    /*
     * Supprime d'abord la subscription
     * dans Supabase.
     */
    await deletePushSubscription(
      subscription
    );

    /*
     * Puis désactive la subscription
     * dans le navigateur.
     */
    return subscription.unsubscribe();
  };

/* ============================================================================
   GET CURRENT SUBSCRIPTION
============================================================================ */

export const getCurrentPushSubscription =
  async (): Promise<
    PushSubscription | null
  > => {
    if (
      !isPushNotificationSupported()
    ) {
      return null;
    }

    const registration =
      await navigator.serviceWorker.ready;

    return registration.pushManager.getSubscription();
  };

/* ============================================================================
   CHECK + SYNC
============================================================================ */

/**
 * Vérifie si une subscription existe déjà
 * et la resynchronise avec Supabase.
 */
export const syncCurrentPushSubscription =
  async (): Promise<
    PushSubscription | null
  > => {
    if (
      !isPushNotificationSupported()
    ) {
      return null;
    }

    const subscription =
      await getCurrentPushSubscription();

    if (!subscription) {
      return null;
    }

    await savePushSubscription(
      subscription
    );

    return subscription;
  };