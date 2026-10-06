import {
  Bell,
  CheckCheck,
  ChevronRight,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import useNotifications from "@/hooks/useNotifications";
import {
  getNotificationOrderId,
  type Notification,
} from "@/services/notifications.service";

const formatNotificationDate = (
  dateString: string
): string => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = Date.now();
  const diff = Math.max(
    0,
    now - date.getTime()
  );

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "À l'instant";
  }

  if (minutes < 60) {
    return `Il y a ${minutes} min`;
  }

  if (hours < 24) {
    return `Il y a ${hours} h`;
  }

  if (days === 1) {
    return "Hier";
  }

  if (days < 7) {
    return `Il y a ${days} j`;
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
};

type NotificationItemProps = {
  notification: Notification;
  onClick: (
    notification: Notification
  ) => void;
  onDelete: (
    notificationId: string
  ) => void;
};

const NotificationItem = ({
  notification,
  onClick,
  onDelete,
}: NotificationItemProps) => {
  return (
    <div
      className={`
        group
        border-b
        border-gray-100
        px-3
        py-3
        transition-colors
        hover:bg-gray-50

        ${
          !notification.is_read
            ? "bg-blue-50/40"
            : "bg-white"
        }
      `}
    >
      <button
        type="button"
        onClick={() =>
          onClick(notification)
        }
        className="w-full text-left outline-none"
      >
        <div className="flex items-start gap-3">

          {/* INDICATOR */}

          <span
            className={`
              mt-1.5
              h-2
              w-2
              shrink-0
              rounded-full
              ${
                notification.is_read
                  ? "bg-gray-300"
                  : "bg-blue-600"
              }
            `}
          />

          {/* CONTENT */}

          <div className="min-w-0 flex-1">

            <div className="flex items-start justify-between gap-2">

              <p className="truncate text-[11px] font-semibold text-gray-900">
                {notification.title}
              </p>

              <span className="shrink-0 text-[9px] font-normal text-gray-400">
                {formatNotificationDate(
                  notification.created_at
                )}
              </span>

            </div>

            <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-gray-500">
              {notification.message}
            </p>

          </div>

        </div>
      </button>

      {/* DELETE */}

      <div className="mt-2 flex justify-end">

        <button
          type="button"
          onClick={() =>
            onDelete(notification.id)
          }
          className="
            rounded-md
            p-1
            text-gray-300
            opacity-0
            transition
            hover:bg-gray-100
            hover:text-gray-500
            group-hover:opacity-100
          "
          aria-label="Supprimer la notification"
        >
          <X size={12} />
        </button>

      </div>
    </div>
  );
};

const NotificationCenter = () => {
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  const [isOpen, setIsOpen] =
    useState(false);

  const containerRef =
    useRef<HTMLDivElement>(null);

  /* =========================================================
     CLICK OUTSIDE
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        !containerRef.current?.contains(
          event.target as Node
        )
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =========================================================
     CLICK NOTIFICATION
  ========================================================= */

  const handleNotificationClick = async (
    notification: Notification
  ) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    setIsOpen(false);

    const orderId =
      getNotificationOrderId(
        notification
      );

    /*
     * Navigation seulement si la notification
     * possède réellement un order_id.
     */
    if (
      notification.type === "order" &&
      orderId
    ) {
      navigate(
        `/dashboard/leaderboard/orders/${orderId}`
      );
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      ref={containerRef}
      className="relative shrink-0"
    >

      {/* =====================================================
          BELL
      ===================================================== */}

      <button
        type="button"
        onClick={() =>
          setIsOpen((value) => !value)
        }
        className="
          relative
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-lg
          text-gray-900
          transition
          hover:bg-gray-100
        "
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell size={17} />

        {unreadCount > 0 && (
          <span
            className="
              absolute
              right-1
              top-1
              flex
              min-h-[14px]
              min-w-[14px]
              items-center
              justify-center
              rounded-full
              bg-blue-600
              px-1
              text-[8px]
              font-semibold
              leading-none
              text-white
            "
          >
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}
      </button>

      {/* =====================================================
          PANEL
      ===================================================== */}

      {isOpen && (
        <div
          className="
            absolute
            right-0
            top-11
            z-50
            w-[min(360px,calc(100vw-24px))]
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-xl
          "
        >

          {/* HEADER */}

          <div
            className="
              flex
              items-center
              justify-between
              gap-3
              border-b
              border-gray-200
              px-3.5
              py-3
            "
          >

            <div>
              <h3 className="text-[12px] font-semibold text-gray-900">
                Notifications
              </h3>

              <p className="mt-0.5 text-[9px] text-gray-400">
                {unreadCount > 0
                  ? `${unreadCount} non lue${
                      unreadCount > 1
                        ? "s"
                        : ""
                    }`
                  : "Aucune notification non lue"}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() =>
                  void markAllAsRead()
                }
                className="
                  flex
                  items-center
                  gap-1
                  rounded-md
                  px-2
                  py-1
                  text-[9px]
                  font-medium
                  text-gray-500
                  transition
                  hover:bg-gray-50
                  hover:text-gray-900
                "
              >
                <CheckCheck size={12} />
                Tout lire
              </button>
            )}

          </div>

          {/* ERROR */}

          {error && (
            <div className="border-b border-red-100 bg-red-50 px-3.5 py-2.5">
              <p className="text-[9px] font-medium text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* CONTENT */}

          <div className="max-h-[420px] overflow-y-auto">

            {loading ? (
              <div className="space-y-3 p-3">
                {Array.from({
                  length: 4,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="flex gap-3"
                  >
                    <div className="skeleton h-2 w-2 rounded-full" />

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="skeleton h-3 w-32 rounded" />
                      <div className="skeleton h-2.5 w-full rounded" />
                      <div className="skeleton h-2.5 w-2/3 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex min-h-[180px] items-center justify-center px-6 text-center">
                <div>
                  <Bell
                    size={20}
                    className="mx-auto text-gray-300"
                  />

                  <p className="mt-2 text-[11px] font-semibold text-gray-700">
                    Aucune notification
                  </p>

                  <p className="mt-1 text-[9px] text-gray-400">
                    Les nouvelles activités
                    apparaîtront ici.
                  </p>
                </div>
              </div>
            ) : (
              notifications.map(
                (notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={
                      notification
                    }
                    onClick={
                      handleNotificationClick
                    }
                    onDelete={(
                      notificationId
                    ) =>
                      void removeNotification(
                        notificationId
                      )
                    }
                  />
                )
              )
            )}

          </div>

          {/* FOOTER */}

          {!loading &&
            notifications.length > 0 && (
              <div className="border-t border-gray-200 px-3 py-2.5">

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    navigate(
                      "/dashboard/notifications"
                    );
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-lg
                    px-2
                    py-2
                    text-[10px]
                    font-medium
                    text-gray-600
                    transition
                    hover:bg-gray-50
                    hover:text-gray-900
                  "
                >
                  <span>
                    Voir toutes les notifications
                  </span>

                  <ChevronRight size={13} />
                </button>

              </div>
            )}

        </div>
      )}

    </div>
  );
};

export default NotificationCenter;