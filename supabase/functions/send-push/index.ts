import { createClient } from "npm:@supabase/supabase-js";
import webPush from "npm:web-push";

type PushSubscriptionRecord = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

type PushRequestBody = {
  notification_id?: string;
};

type NotificationPushRecord = {
  id: string;
  recipient_id: string;
  title: string;
  message: string;
  type: string;
  metadata: Record<string, unknown> | null;
};

const jsonResponse = (
  status: number,
  body: Record<string, unknown>
): Response => {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

const normalizeString = (
  value: unknown
): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
};

const isValidRequestBody = (
  body: unknown
): body is PushRequestBody => {
  if (!body || typeof body !== "object") {
    return false;
  }

  const candidate = body as PushRequestBody;

  return Boolean(normalizeString(candidate.notification_id));
};

const sanitizeNotificationData = (
  notification: NotificationPushRecord
): { type: string; orderId?: string } => {
  const rawType = normalizeString(notification.type);
  const orderId =
    (notification.metadata &&
    typeof notification.metadata === "object"
      ? normalizeString(notification.metadata.orderId) ??
        normalizeString(notification.metadata.order_id)
      : null);

  return {
    type: rawType === "payment" ? "payment" : rawType === "order" ? "order" : "info",
    ...(orderId ? { orderId } : {}),
  };
};

const getPushStatusCode = (
  error: unknown
): number | null => {
  if (
    error &&
    typeof error === "object" &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    return error.statusCode;
  }

  return null;
};

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse(405, {
      ok: false,
      error: "Method not allowed",
    });
  }

  const expectedSecret =
    Deno.env.get("PUSH_WEBHOOK_SECRET");

  if (!expectedSecret) {
    return jsonResponse(500, {
      ok: false,
      error: "Server configuration missing",
    });
  }

  const authorizationHeader =
    req.headers.get("authorization");

  if (
    authorizationHeader !==
    `Bearer ${expectedSecret}`
  ) {
    return jsonResponse(401, {
      ok: false,
      error: "Unauthorized",
    });
  }

  let payload: unknown;

  try {
    payload = await req.json();
  } catch {
    return jsonResponse(400, {
      ok: false,
      error: "Invalid JSON body",
    });
  }

  if (!isValidRequestBody(payload)) {
    return jsonResponse(400, {
      ok: false,
      error: "Invalid push payload",
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get(
    "SUPABASE_SERVICE_ROLE_KEY"
  );

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return jsonResponse(500, {
      ok: false,
      error: "Server configuration missing",
    });
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const notificationId = normalizeString(payload.notification_id);

  if (!notificationId) {
    return jsonResponse(400, {
      ok: false,
      error: "Invalid notification id",
    });
  }

  const { data: notificationData, error: notificationError } = await supabase
    .from("notifications")
    .select("id, recipient_id, title, message, type, metadata")
    .eq("id", notificationId)
    .maybeSingle();

  if (notificationError) {
    return jsonResponse(500, {
      ok: false,
      error: "Unable to load notification",
    });
  }

  const notification = notificationData as NotificationPushRecord | null;

  if (!notification?.recipient_id) {
    return jsonResponse(404, {
      ok: false,
      error: "Notification recipient not found",
    });
  }

  const publicKey =
    Deno.env.get("VAPID_PUBLIC_KEY");
  const privateKey =
    Deno.env.get("VAPID_PRIVATE_KEY");

  if (!publicKey || !privateKey) {
    return jsonResponse(500, {
      ok: false,
      error: "VAPID configuration missing",
    });
  }

  webPush.setVapidDetails(
    "mailto:hello@nexa.app",
    publicKey,
    privateKey
  );

  const { data: subscriptions, error } =
    await supabase
      .from("push_subscriptions")
      .select(
        "id, user_id, endpoint, p256dh, auth"
      )
      .eq("user_id", notification.recipient_id);

  if (error) {
    return jsonResponse(500, {
      ok: false,
      error: "Unable to load subscriptions",
    });
  }

  const records = (subscriptions ?? []) as PushSubscriptionRecord[];

  if (records.length === 0) {
    return jsonResponse(200, {
      ok: true,
      sent: 0,
      invalidSubscriptions: 0,
    });
  }

  const notificationPayload = {
    title: notification.title,
    body: notification.message,
    data: sanitizeNotificationData(notification),
  };

  const sent = [] as string[];
  const invalid = [] as string[];
  let failed = 0;

  await Promise.all(
    records.map(async (subscription) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify(notificationPayload)
        );

        sent.push(subscription.id);
      } catch (error) {
        const statusCode = getPushStatusCode(error);

        if (statusCode === 404 || statusCode === 410) {
          invalid.push(subscription.id);

          const { error: deleteError } =
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("id", subscription.id);

          if (deleteError) {
            console.error(
              "Unable to delete expired push subscription"
            );
          }

          return;
        }

        failed += 1;
        console.error(
          "Push delivery failed",
          statusCode ? `HTTP ${statusCode}` : "without an HTTP status"
        );
      }
    })
  );

  return jsonResponse(failed > 0 ? 502 : 200, {
    ok: failed === 0,
    sent: sent.length,
    invalidSubscriptions: invalid.length,
    failed,
  });
});
