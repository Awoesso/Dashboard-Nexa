-- Secrets expected in Vault:
-- SUPABASE_URL, PUSH_WEBHOOK_SECRET, SUPABASE_PUBLISHABLE_KEY,
-- PUSH_RECIPIENT_USER_ID.
-- The decrypted values are copied into pg_net's temporary request queue.
-- Restrict that queue to trusted database roles; Vault encryption does not
-- encrypt request headers after pg_net has queued them.

REVOKE ALL ON vault.decrypted_secrets
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON TABLE net.http_request_queue
  FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.dispatch_order_push(
  recipient_user_id text,
  notification_title text,
  notification_body text,
  order_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  target_url text;
  push_secret text;
  publishable_key text;
  fallback_recipient_id text;
  effective_recipient_id text;
BEGIN
  SELECT decrypted_secret INTO STRICT target_url
  FROM vault.decrypted_secrets
  WHERE name = 'SUPABASE_URL';

  SELECT decrypted_secret INTO STRICT push_secret
  FROM vault.decrypted_secrets
  WHERE name = 'PUSH_WEBHOOK_SECRET';

  SELECT decrypted_secret INTO STRICT publishable_key
  FROM vault.decrypted_secrets
  WHERE name = 'SUPABASE_PUBLISHABLE_KEY';

  SELECT decrypted_secret INTO fallback_recipient_id
  FROM vault.decrypted_secrets
  WHERE name = 'PUSH_RECIPIENT_USER_ID'
  LIMIT 1;

  effective_recipient_id := COALESCE(
    NULLIF(recipient_user_id, ''),
    NULLIF(fallback_recipient_id, '')
  );

    IF COALESCE(target_url, '') = ''
      OR target_url !~* '^https://[^/]+/?$'
      OR COALESCE(push_secret, '') = ''
      OR left(COALESCE(publishable_key, ''), 15) <> 'sb_publishable_'
      OR COALESCE(effective_recipient_id, '') !~*
       '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RETURN;
  END IF;

  PERFORM net.http_post(
    url := rtrim(target_url, '/') || '/functions/v1/send-push',
    body := jsonb_build_object(
      'user_id', effective_recipient_id,
      'title', notification_title,
      'body', notification_body,
      'type', 'order',
      'order_id', order_id
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', publishable_key,
      'Authorization', 'Bearer ' || push_secret
    ),
    timeout_milliseconds := 5000
  );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Push enqueue failed; order creation retained.';
END;
$$;

ALTER FUNCTION public.dispatch_order_push(text, text, text, text)
  OWNER TO postgres;
REVOKE ALL ON FUNCTION public.dispatch_order_push(text, text, text, text)
  FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.notify_push_on_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  order_json jsonb;
  recipient_user_id text;
  order_id text;
  order_number text;
BEGIN
  BEGIN
    order_json := to_jsonb(NEW);
    order_id := NULLIF(order_json->>'id', '');
    order_number := COALESCE(
      NULLIF(order_json->>'order_number', ''),
      order_id,
      'Nouvelle'
    );
    recipient_user_id := COALESCE(
      NULLIF(order_json->>'owner_id', ''),
      NULLIF(order_json->>'store_owner_id', '')
    );

    PERFORM public.dispatch_order_push(
      recipient_user_id,
      'Nouvelle commande #' || order_number,
      'Une nouvelle commande a été reçue.',
      order_id
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Push dispatch failed; order creation retained.';
  END;

  RETURN NEW;
END;
$$;

ALTER FUNCTION public.notify_push_on_new_order()
  OWNER TO postgres;

DROP TRIGGER IF EXISTS orders_push_trigger ON public.orders;
CREATE TRIGGER orders_push_trigger
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_push_on_new_order();

REVOKE ALL ON FUNCTION public.notify_push_on_new_order()
  FROM PUBLIC, anon, authenticated, service_role;

-- Keep the order INSERT as the only Push source. The three existing internal
-- notification triggers are not changed; removing this legacy Push trigger
-- prevents a notification row from causing a second Push for the same order.
DROP TRIGGER IF EXISTS notifications_push_trigger ON public.notifications;
