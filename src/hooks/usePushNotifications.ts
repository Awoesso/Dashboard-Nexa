import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getCurrentPushSubscription,
  isPushNotificationSupported,
  requestNotificationPermission,
  subscribeToPushNotifications,
  syncCurrentPushSubscription,
  unsubscribeFromPushNotifications,
} from "@/lib/pushNotifications";

interface UsePushNotificationsReturn {
  supported: boolean;

  permission: NotificationPermission;

  subscription: PushSubscription | null;

  enabled: boolean;

  loading: boolean;

  error: string | null;

  /**
   * Vérifie l'état actuel sans demander
   * la permission au navigateur.
   */
  refresh: () => Promise<void>;

  /**
   * Demande la permission uniquement quand
   * l'UI Nexa décide de l'appeler.
   */
  enable: () => Promise<boolean>;

  /**
   * Désactive les Push et supprime la
   * subscription côté Supabase.
   */
  disable: () => Promise<boolean>;
}

export const usePushNotifications =
  (): UsePushNotificationsReturn => {
    const [supported, setSupported] =
      useState(false);

    const [permission, setPermission] =
      useState<NotificationPermission>(
        "default"
      );

    const [subscription, setSubscription] =
      useState<PushSubscription | null>(
        null
      );

    const [loading, setLoading] =
      useState(true);

    const [error, setError] =
      useState<string | null>(null);

    /* =========================================================
       REFRESH
       Aucun popup / aucune demande ici.
    ========================================================= */

    const refresh = useCallback(
      async (): Promise<void> => {
        const isSupported =
          isPushNotificationSupported();

        setSupported(isSupported);

        if (!isSupported) {
          setPermission("denied");
          setSubscription(null);
          setLoading(false);

          return;
        }

        try {
          setError(null);

          const currentPermission =
            Notification.permission;

          setPermission(
            currentPermission
          );

          const currentSubscription =
            await getCurrentPushSubscription();

          setSubscription(
            currentSubscription
          );

          /*
           * Si une subscription existe déjà,
           * on la resynchronise simplement avec
           * Supabase.
           */
          if (
            currentSubscription &&
            currentPermission === "granted"
          ) {
            await syncCurrentPushSubscription();
          }
        } catch (error: unknown) {
          console.error(
            "Erreur vérification Push :",
            error
          );

          setError(
            error instanceof Error
              ? error.message
              : "Impossible de vérifier les notifications."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

    /* =========================================================
       INITIAL CHECK
    ========================================================= */

    useEffect(() => {
      void refresh();
    }, [refresh]);

    /* =========================================================
       ENABLE
       Appelé uniquement par notre UI Nexa.
    ========================================================= */

    const enable = useCallback(
      async (): Promise<boolean> => {
        if (
          !isPushNotificationSupported()
        ) {
          setError(
            "Les notifications Push ne sont pas supportées par ce navigateur."
          );

          return false;
        }

        try {
          setLoading(true);
          setError(null);

          /*
           * C'est ICI seulement qu'on demande
           * la permission du navigateur.
           */
          const nextPermission =
            await requestNotificationPermission();

          setPermission(
            nextPermission
          );

          if (
            nextPermission !== "granted"
          ) {
            setSubscription(null);

            return false;
          }

          const nextSubscription =
            await subscribeToPushNotifications();

          if (!nextSubscription) {
            setSubscription(null);

            return false;
          }

          setSubscription(
            nextSubscription
          );

          return true;
        } catch (error: unknown) {
          console.error(
            "Erreur activation Push :",
            error
          );

          setError(
            error instanceof Error
              ? error.message
              : "Impossible d'activer les notifications."
          );

          return false;
        } finally {
          setLoading(false);
        }
      },
      []
    );

    /* =========================================================
       DISABLE
    ========================================================= */

    const disable = useCallback(
      async (): Promise<boolean> => {
        if (
          !isPushNotificationSupported()
        ) {
          return false;
        }

        try {
          setLoading(true);
          setError(null);

          const success =
            await unsubscribeFromPushNotifications();

          if (success) {
            setSubscription(null);
          }

          /*
           * Une permission "granted" peut rester
           * granted même après unsubscribe.
           * C'est normal.
           */
          setPermission(
            Notification.permission
          );

          return success;
        } catch (error: unknown) {
          console.error(
            "Erreur désactivation Push :",
            error
          );

          setError(
            error instanceof Error
              ? error.message
              : "Impossible de désactiver les notifications."
          );

          return false;
        } finally {
          setLoading(false);
        }
      },
      []
    );

    return {
      supported,

      permission,

      subscription,

      enabled:
        supported &&
        permission === "granted" &&
        Boolean(subscription),

      loading,

      error,

      refresh,

      enable,

      disable,
    };
  };

export default usePushNotifications;