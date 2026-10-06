import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  deleteNotification,
  deleteReadNotifications,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  subscribeToNotifications,
  type Notification,
} from "@/services/notifications.service";

interface UseNotificationsReturn {
  notifications: Notification[];

  unreadCount: number;

  loading: boolean;
  error: string | null;

  refresh: () => Promise<void>;

  markAsRead: (
    notificationId: string
  ) => Promise<void>;

  markAllAsRead: () => Promise<void>;

  removeNotification: (
    notificationId: string
  ) => Promise<void>;

  removeReadNotifications: () => Promise<void>;
}

const MAX_NOTIFICATIONS = 50;

export const useNotifications =
  (): UseNotificationsReturn => {
    const [
      notifications,
      setNotifications,
    ] = useState<Notification[]>([]);

    const [loading, setLoading] =
      useState(true);

    const [error, setError] =
      useState<string | null>(null);

    const mountedRef = useRef(true);

    /* ========================================================================
       REFRESH
    ======================================================================== */

    const refresh = useCallback(
      async (): Promise<void> => {
        try {
          const data =
            await getNotifications(
              MAX_NOTIFICATIONS
            );

          if (!mountedRef.current) {
            return;
          }

          setError(null);
          setNotifications(data);
        } catch (error: unknown) {
          console.error(
            "Erreur notifications :",
            error
          );

          if (!mountedRef.current) {
            return;
          }

          setError(
            error instanceof Error
              ? error.message
              : "Impossible de charger les notifications."
          );
        } finally {
          if (mountedRef.current) {
            setLoading(false);
          }
        }
      },
      []
    );

    /* ========================================================================
       INITIAL LOAD + REALTIME
    ======================================================================== */

    useEffect(() => {
      let active = true;
      mountedRef.current = true;

      queueMicrotask(() => {
        if (active) {
          void refresh();
        }
      });

      const unsubscribe =
        subscribeToNotifications({
          /* ---------------------------------------------------------------
             INSERT
          --------------------------------------------------------------- */

          onInsert: (newNotification) => {
            if (!mountedRef.current) {
              return;
            }

            setNotifications(
              (current) => {
                const alreadyExists =
                  current.some(
                    (item) =>
                      item.id ===
                      newNotification.id
                  );

                if (alreadyExists) {
                  return current;
                }

                return [
                  newNotification,
                  ...current,
                ].slice(
                  0,
                  MAX_NOTIFICATIONS
                );
              }
            );
          },

          /* ---------------------------------------------------------------
             UPDATE
          --------------------------------------------------------------- */

          onUpdate: (updatedNotification) => {
            if (!mountedRef.current) {
              return;
            }

            setNotifications(
              (current) =>
                current.map((item) =>
                  item.id ===
                  updatedNotification.id
                    ? updatedNotification
                    : item
                )
            );
          },

          /* ---------------------------------------------------------------
             DELETE
          --------------------------------------------------------------- */

          onDelete: (deletedNotification) => {
            if (!mountedRef.current) {
              return;
            }

            setNotifications(
              (current) =>
                current.filter(
                  (item) =>
                    item.id !==
                    deletedNotification.id
                )
            );
          },
        });

      return () => {
        active = false;
        mountedRef.current = false;
        unsubscribe();
      };
    }, [refresh]);

    /* ========================================================================
       UNREAD COUNT
    ======================================================================== */

    const unreadCount = useMemo(() => {
      return notifications.filter(
        (notification) =>
          !notification.is_read
      ).length;
    }, [notifications]);

    /* ========================================================================
       MARK ONE AS READ
    ======================================================================== */

    const markAsRead = useCallback(
      async (
        notificationId: string
      ): Promise<void> => {
        if (!notificationId) {
          return;
        }

        const previous =
          notifications;

        /*
         * Optimistic UI :
         * le badge disparaît immédiatement.
         */
        setNotifications(
          (current) =>
            current.map((notification) =>
              notification.id ===
              notificationId
                ? {
                    ...notification,
                    is_read: true,
                  }
                : notification
            )
        );

        try {
          const updated =
            await markNotificationAsRead(
              notificationId
            );

          if (!mountedRef.current) {
            return;
          }

          setNotifications(
            (current) =>
              current.map((notification) =>
                notification.id ===
                updated.id
                  ? updated
                  : notification
              )
          );
        } catch (error: unknown) {
          console.error(
            "Erreur lecture notification :",
            error
          );

          if (!mountedRef.current) {
            return;
          }

          setNotifications(previous);

          setError(
            error instanceof Error
              ? error.message
              : "Impossible de modifier la notification."
          );
        }
      },
      [notifications]
    );

    /* ========================================================================
       MARK ALL AS READ
    ======================================================================== */

    const markAllAsRead = useCallback(
      async (): Promise<void> => {
        const previous =
          notifications;

        setNotifications(
          (current) =>
            current.map((notification) => ({
              ...notification,
              is_read: true,
            }))
        );

        try {
          await markAllNotificationsAsRead();
        } catch (error: unknown) {
          console.error(
            "Erreur lecture notifications :",
            error
          );

          if (!mountedRef.current) {
            return;
          }

          setNotifications(previous);

          setError(
            error instanceof Error
              ? error.message
              : "Impossible de marquer les notifications comme lues."
          );
        }
      },
      [notifications]
    );

    /* ========================================================================
       DELETE ONE
    ======================================================================== */

    const removeNotification =
      useCallback(
        async (
          notificationId: string
        ): Promise<void> => {
          if (!notificationId) {
            return;
          }

          const previous =
            notifications;

          setNotifications(
            (current) =>
              current.filter(
                (notification) =>
                  notification.id !==
                  notificationId
              )
          );

          try {
            await deleteNotification(
              notificationId
            );
          } catch (error: unknown) {
            console.error(
              "Erreur suppression notification :",
              error
            );

            if (!mountedRef.current) {
              return;
            }

            setNotifications(previous);

            setError(
              error instanceof Error
                ? error.message
                : "Impossible de supprimer la notification."
            );
          }
        },
        [notifications]
      );

    /* ========================================================================
       DELETE READ
    ======================================================================== */

    const removeReadNotifications =
      useCallback(
        async (): Promise<void> => {
          const previous =
            notifications;

          setNotifications(
            (current) =>
              current.filter(
                (notification) =>
                  !notification.is_read
              )
          );

          try {
            await deleteReadNotifications();
          } catch (error: unknown) {
            console.error(
              "Erreur suppression notifications lues :",
              error
            );

            if (!mountedRef.current) {
              return;
            }

            setNotifications(previous);

            setError(
              error instanceof Error
                ? error.message
                : "Impossible de supprimer les notifications lues."
            );
          }
        },
        [notifications]
      );

    return {
      notifications,
      unreadCount,

      loading,
      error,

      refresh,

      markAsRead,
      markAllAsRead,

      removeNotification,
      removeReadNotifications,
    };
  };

export default useNotifications;