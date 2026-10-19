import {
  Bell,
  ChevronRight,
  SlidersHorizontal,
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
  const diff = Math.max(0, now - date.getTime());

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours} h`;
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} j`;

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
};

type NotificationItemProps = {
  notification: Notification;
  onClick: (notification: Notification) => void;
  onDelete: (notificationId: string) => void;
};

const NotificationItem = ({
  notification,
  onClick,
  onDelete,
}: NotificationItemProps) => {
  // Déterminer les initiales si pas d'image
  const initials = notification.title
    ? notification.title.substring(0, 2).toUpperCase()
    : "NT";

  return (
    <div
      className={`
        group relative flex items-start gap-3 border-b border-gray-100/70 px-4 py-3.5
        transition-colors hover:bg-gray-50/80
        ${!notification.is_read ? "bg-blue-50/20" : "bg-white"}
      `}
    >
      {/* AVATAR / ICON WITH STATUS BADGE */}
      <div className="relative shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
          {initials}
        </div>

        {/* Status dot badge on avatar */}
        <span
          className={`
            absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white
            ${!notification.is_read ? "bg-emerald-500" : "bg-blue-500"}
          `}
        />
      </div>

      {/* CONTENT */}
      <button
        type="button"
        onClick={() => onClick(notification)}
        className="min-w-0 flex-1 text-left outline-none"
      >
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-xs font-semibold text-gray-900!">
            {notification.title}
          </p>
          <span className="shrink-0 text-[10px]! font-normal text-gray-400!">
            {formatNotificationDate(notification.created_at)}
          </span>
        </div>

        <p className="mt-0.5 line-clamp-2 text-[11px]! leading-relaxed text-gray-500">
          {notification.message}
        </p>
      </button>

      {/* UNREAD BLUE DOT OR DELETE BUTTON */}
      <div className="flex shrink-0 items-center justify-center self-center pl-1">
        {!notification.is_read ? (
          <span className="h-2 w-2 rounded-full bg-blue-600 group-hover:hidden" />
        ) : null}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className={`
            rounded-md p-1 text-gray-500 transition-all hover:bg-gray-200/60 hover:text-gray-600
            ${!notification.is_read ? "hidden group-hover:block" : "opacity-0 group-hover:opacity-100"}
          `}
          aria-label="Supprimer la notification"
        >
          <X size={13} />
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

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !containerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    setIsOpen(false);

    const orderId = getNotificationOrderId(notification);

    if (notification.type === "order" && orderId) {
      navigate(`/dashboard/leaderboard/orders/${orderId}`);
    }
  };

  // Filtrage selon l'onglet
  const displayedNotifications =
    activeTab === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  return (
    <div ref={containerRef} className="relative shrink-0">
      {/* BELL BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen((val) => !val)}
        className="
          relative flex h-9 w-9 items-center justify-center rounded-full
          bg-gray-50 text-gray-700 transition hover:bg-gray-100 hover:text-gray-900
          focus:outline-none
        "
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell size={17} />

        {unreadCount > 0 && (
          <span
            className="
              absolute right-1 top-1 flex h-2 w-2 items-center justify-center
              rounded-full bg-blue-600 ring-2 ring-white
            "
          />
        )}
      </button>

      {/* PANEL */}
      {isOpen && (
        <div
          className="
            absolute right-0 top-12 z-50 w-[min(380px,calc(100vw-24px))]
            overflow-hidden rounded-2xl border border-gray-100 bg-white
            shadow-2xl shadow-gray-900/10
          "
        >
          {/* TOP HEADER */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h3 className="text-base font-semibold text-gray-900">
              Notification
            </h3>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                className="text-xs font-medium text-blue-600 transition hover:text-blue-700"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* TABS & FILTER BAR */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5">
            <div className="flex gap-6">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`
                  relative pb-2.5 text-xs! font-semibold transition-colors
                  ${
                    activeTab === "all"
                      ? "text-slate-800"
                      : "text-gray-400 hover:text-gray-600"
                  }
                `}
              >
                Toutes les notifications
                {activeTab === "all" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-slate-800" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("unread")}
                className={`
                  relative pb-2.5 text-xs! font-semibold transition-colors
                  ${
                    activeTab === "unread"
                      ? "text-slate-800"
                      : "text-gray-400 hover:text-gray-600"
                  }
                `}
              >
                Non lues ({unreadCount})
                {activeTab === "unread" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-slate-800" />
                )}
              </button>
            </div>

            <button
              type="button"
              className="mb-2 text-gray-400 transition hover:text-gray-600"
              aria-label="Filtrer"
            >
              <SlidersHorizontal size={14} />
            </button>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="bg-red-50 px-5 py-2.5">
              <p className="text-[10px]! font-medium text-red-600">{error}</p>
            </div>
          )}

          {/* NOTIFICATIONS LIST */}
          <div className="max-h-[380px] overflow-y-auto">
            {loading ? (
              <div className="space-y-4 p-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="skeleton h-9 w-9 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-3 w-28 rounded bg-gray-200" />
                      <div className="skeleton h-2.5 w-full rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="flex min-h-[180px] items-center justify-center px-6 text-center">
                <div>
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <Bell size={18} />
                  </div>
                  <p className="mt-2.5 text-xs! font-semibold text-gray-700!">
                    Aucune notification
                  </p>
                  <p className="mt-0.5 text-[10px]! text-gray-400!">
                    Vous êtes à jour !
                  </p>
                </div>
              </div>
            ) : (
              displayedNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={handleNotificationClick}
                  onDelete={(id) => void removeNotification(id)}
                />
              ))
            )}
          </div>

          {/* FOOTER */}
          {!loading && notifications.length > 0 && (
            <div className="border-t border-gray-100 p-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/dashboard/notifications");
                }}
                className="
                  flex w-full items-center justify-center gap-1.5 rounded-lg py-2
                  text-xs! font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900
                "
              >
                Voir toutes les notifications
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;