import {
  useCallback,
  useEffect,
  useRef,
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

const getCurrentPushState = async () => {
  const supported = isPushNotificationSupported();
  if (!supported) {
    return {
      supported,
      permission: "denied" as NotificationPermission,
      subscription: null,
    };
  }

  return {
    supported,
    permission: Notification.permission,
    subscription: await getCurrentPushSubscription(),
  };
};

const loadCurrentPushState = async () => {
  const currentState = await getCurrentPushState();
  if (currentState.subscription && currentState.permission === "granted") {
    await syncCurrentPushSubscription();
  }
  return currentState;
};

export const usePushNotifications =
  (): UsePushNotificationsReturn => {
    const enableInFlightRef =
      useRef<Promise<boolean> | null>(null);

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
        try {
          const currentState = await loadCurrentPushState();
          setSupported(currentState.supported);
          setPermission(currentState.permission);
          setSubscription(currentState.subscription);
          setError(null);
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
      let active = true;
      void loadCurrentPushState()
        .then((currentState) => {
          if (!active) return;
          setSupported(currentState.supported);
          setPermission(currentState.permission);
          setSubscription(currentState.subscription);
          setError(null);
        })
        .catch((error: unknown) => {
          if (!active) return;
          console.error("Erreur vérification Push :", error);
          setError(
            error instanceof Error
              ? error.message
              : "Impossible de vérifier les notifications.",
          );
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
      };
    }, []);

    /* =========================================================
       ENABLE
       Appelé uniquement par notre UI Nexa.
    ========================================================= */

    const enable = useCallback(
      async (): Promise<boolean> => {
        if (
          enableInFlightRef.current
        ) {
          return enableInFlightRef.current;
        }

        if (
          !isPushNotificationSupported()
        ) {
          setError(
            "Les notifications Push ne sont pas supportées par ce navigateur."
          );

          return false;
        }

        const operation = (async (): Promise<boolean> => {
          try {
            setLoading(true);
            setError(null);

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
            enableInFlightRef.current = null;
          }
        })();

        enableInFlightRef.current = operation;

        return operation;
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