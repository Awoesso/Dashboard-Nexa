import { supabase } from "@/lib/supabase";

/* ============================================================================
   TYPES
============================================================================ */

export type NotificationType =
  | "order"
  | "payment"
  | "info"
  | "system"
  | string;

export type NotificationMetadata =
  | Record<string, unknown>
  | null;

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  metadata: NotificationMetadata;
  created_at: string;
}

const NOTIFICATION_COLUMNS = `
  id,
  title,
  message,
  type,
  is_read,
  metadata,
  created_at
`;

/* ============================================================================
   HELPERS
============================================================================ */

const normalizeNotification = (
  notification: Partial<Notification>
): Notification => {
  return {
    id: String(notification.id ?? ""),
    title: String(notification.title ?? ""),
    message: String(notification.message ?? ""),
    type: String(notification.type ?? "info"),
    is_read: Boolean(notification.is_read),
    metadata:
      notification.metadata &&
      typeof notification.metadata === "object"
        ? notification.metadata
        : null,
    created_at: String(
      notification.created_at ?? ""
    ),
  };
};

const sortNotifications = (
  notifications: Notification[]
): Notification[] => {
  return [...notifications].sort((a, b) => {
    const dateA = new Date(
      a.created_at
    ).getTime();

    const dateB = new Date(
      b.created_at
    ).getTime();

    return dateB - dateA;
  });
};

/* ============================================================================
   GET
============================================================================ */

export async function getNotifications(
  limit = 50
): Promise<Notification[]> {
  const safeLimit = Math.max(
    1,
    Math.min(limit, 100)
  );

  const { data, error } = await supabase
    .from("notifications")
    .select(NOTIFICATION_COLUMNS)
    .order("created_at", {
      ascending: false,
    })
    .limit(safeLimit);

  if (error) {
    throw new Error(
      `Impossible de charger les notifications : ${error.message}`
    );
  }

  return sortNotifications(
    (data ?? []).map((item) =>
      normalizeNotification(
        item as Partial<Notification>
      )
    )
  );
}

/* ============================================================================
   GET UNREAD COUNT
============================================================================ */

export async function getUnreadNotificationCount(): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("is_read", false);

  if (error) {
    throw new Error(
      `Impossible de compter les notifications non lues : ${error.message}`
    );
  }

  return count ?? 0;
}

/* ============================================================================
   MARK ONE AS READ
============================================================================ */

export async function markNotificationAsRead(
  notificationId: string
): Promise<Notification> {
  if (!notificationId) {
    throw new Error(
      "L'identifiant de la notification est requis."
    );
  }

  const { data, error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
    })
    .eq("id", notificationId)
    .select(NOTIFICATION_COLUMNS)
    .single();

  if (error) {
    throw new Error(
      `Impossible de marquer la notification comme lue : ${error.message}`
    );
  }

  return normalizeNotification(
    data as Partial<Notification>
  );
}

/* ============================================================================
   MARK ALL AS READ
============================================================================ */

export async function markAllNotificationsAsRead(): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
    })
    .eq("is_read", false);

  if (error) {
    throw new Error(
      `Impossible de marquer les notifications comme lues : ${error.message}`
    );
  }
}

/* ============================================================================
   DELETE ONE
============================================================================ */

export async function deleteNotification(
  notificationId: string
): Promise<void> {
  if (!notificationId) {
    throw new Error(
      "L'identifiant de la notification est requis."
    );
  }

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId);

  if (error) {
    throw new Error(
      `Impossible de supprimer la notification : ${error.message}`
    );
  }
}

/* ============================================================================
   DELETE ALL READ
============================================================================ */

export async function deleteReadNotifications(): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("is_read", true);

  if (error) {
    throw new Error(
      `Impossible de supprimer les notifications lues : ${error.message}`
    );
  }
}

/* ============================================================================
   REALTIME
============================================================================ */

type NotificationCallbacks = {
  onInsert?: (notification: Notification) => void;
  onUpdate?: (notification: Notification) => void;
  onDelete?: (notification: Notification) => void;
};

let notificationChannelSequence = 0;

export function subscribeToNotifications(
  callbacks: NotificationCallbacks
): () => void {
  const channelTopic =
    `nexa-notifications-${Date.now()}-${notificationChannelSequence++}`;

  const channel = supabase
    .channel(channelTopic)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
      },
      (payload) => {
        callbacks.onInsert?.(
          normalizeNotification(
            payload.new as Partial<Notification>
          )
        );
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "notifications",
      },
      (payload) => {
        callbacks.onUpdate?.(
          normalizeNotification(
            payload.new as Partial<Notification>
          )
        );
      }
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "notifications",
      },
      (payload) => {
        callbacks.onDelete?.(
          normalizeNotification(
            payload.old as Partial<Notification>
          )
        );
      }
    )
    .subscribe((status) => {
      if (status === "CHANNEL_ERROR") {
        console.error(
          "Erreur Realtime notifications."
        );
      }
    });

  return () => {
    void supabase.removeChannel(channel);
  };
}

/* ============================================================================
   METADATA HELPERS
============================================================================ */

export function getNotificationOrderId(
  notification: Notification
): string | null {
  const metadata = notification.metadata;

  if (!metadata) {
    return null;
  }

  const possibleKeys = [
    "order_id",
    "orderId",
  ];

  for (const key of possibleKeys) {
    const value = metadata[key];

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value;
    }
  }

  return null;
}

export function getNotificationOrderNumber(
  notification: Notification
): string | null {
  const metadata = notification.metadata;

  if (!metadata) {
    return null;
  }

  const possibleKeys = [
    "order_number",
    "orderNumber",
  ];

  for (const key of possibleKeys) {
    const value = metadata[key];

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value;
    }
  }

  return null;
}