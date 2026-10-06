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
  user_id?: string;
  userId?: string;
  title?: string;
  body?: string;
  type?: string;
  order_id?: string;
  orderId?: string;
  metadata?: Record<string, unknown>;
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

  const userId =
    normalizeString(candidate.user_id) ??
    normalizeString(candidate.userId);

  const title = normalizeString(candidate.title);
  const bodyText = normalizeString(candidate.body);

  if (!userId) {
    return false;
  }

  if (!title || !bodyText) {
    return false;
  }

  return true;
};

const sanitizeNotificationData = (
  body: PushRequestBody
): { type: string; orderId?: string } => {
  const rawType = normalizeString(body.type);
  const orderId =
    normalizeString(body.order_id) ??
    normalizeString(body.orderId) ??
    (body.metadata &&
    typeof body.metadata === "object"
      ? normalizeString(
          body.metadata.orderId as unknown
        ) ??
        normalizeString(
          body.metadata.order_id as unknown
        )
      : null);

  return {
    type: rawType === "order" ? "order" : "info",
    ...(orderId ? { orderId } : {}),
  };
};

const isExpiredPushError = (
  message: string
): boolean => {
  return /410|gone|expired|invalid|unauthorized/i.test(
    message
  );
};

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse(405, {
      ok: false,
      error: "Method not allowed",
    });
  }

  const expectedSecret =
    Deno.env.get("PUSH_WEBHOOK_SECRET") ??
    Deno.env.get("SEND_PUSH_SECRET");

  if (expectedSecret) {
    const authorizationHeader =
      req.headers.get("authorization") ??
      req.headers.get("x-push-secret");

    const secretValue =
      authorizationHeader?.startsWith("Bearer ")
        ? authorizationHeader.replace(/^Bearer\s+/i, "")
        : authorizationHeader;

    if (!secretValue || secretValue !== expectedSecret) {
      return jsonResponse(401, {
        ok: false,
        error: "Unauthorized",
      });
    }
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

  const userId =
    normalizeString(payload.user_id) ??
    normalizeString(payload.userId);

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
      .eq("user_id", userId);

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
    title: payload.title,
    body: payload.body,
    data: sanitizeNotificationData(payload),
  };

  const sent = [] as string[];
  const invalid = [] as string[];

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
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        if (isExpiredPushError(message)) {
          invalid.push(subscription.id);

          const { error: deleteError } =
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("id", subscription.id);

          if (deleteError) {
            console.error(
              "Unable to delete expired subscription"
            );
          }

          return;
        }

        console.error(
          "Push delivery failed for subscription"
        );
      }
    })
  );

  return jsonResponse(200, {
    ok: true,
    sent: sent.length,
    invalidSubscriptions: invalid.length,
  });
});
