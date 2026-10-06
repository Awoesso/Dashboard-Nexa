-- ============================================================
-- Trigger sécurisé : créer une notification métier -> déclencher send-push
-- ============================================================
-- Ce trigger ne doit jamais être appelé depuis le frontend.
-- Il doit uniquement partir du backend Supabase lorsqu'une vraie ligne est
-- insérée dans public.notifications.
--
-- À configurer côté Supabase :
-- 1) app.settings.supabase_url = https://<project-ref>.supabase.co
-- 2) app.settings.push_webhook_secret = <secret identique à PUSH_WEBHOOK_SECRET>
-- 3) Le secret ne doit pas être exposé au frontend.
--
-- Le payload de notification doit contenir au minimum :
-- - user_id (ou userId) dans metadata
-- - title
-- - body
-- - type
-- - order_id (ou orderId) si c'est une commande
--
-- Exemple attendu dans metadata :
-- { "user_id": "uuid", "order_id": "uuid" }
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.notify_push_on_new_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_url text;
  push_secret text;
  user_id text;
  order_id text;
  metadata_json jsonb;
  payload jsonb;
  response jsonb;
BEGIN
  -- On ne déclenche que les notifications métier utiles au push
  IF NEW.type IS DISTINCT FROM 'order' THEN
    RETURN NEW;
  END IF;

  metadata_json := COALESCE(NEW.metadata, '{}'::jsonb);
  user_id := NULLIF(metadata_json->>'user_id', '');

  IF user_id IS NULL THEN
    user_id := NULLIF(metadata_json->>'userId', '');
  END IF;

  IF user_id IS NULL THEN
    RETURN NEW;
  END IF;

  order_id := NULLIF(metadata_json->>'order_id', '');
  IF order_id IS NULL THEN
    order_id := NULLIF(metadata_json->>'orderId', '');
  END IF;

  target_url := current_setting('app.settings.supabase_url', true);
  push_secret := current_setting('app.settings.push_webhook_secret', true);

  IF target_url IS NULL OR target_url = '' THEN
    RETURN NEW;
  END IF;

  payload := jsonb_build_object(
    'user_id', user_id,
    'title', NEW.title,
    'body', NEW.body,
    'type', NEW.type,
    'metadata', metadata_json,
    'order_id', order_id,
    'orderId', order_id
  );

  -- Appel sécurisé vers l'Edge Function de push.
  -- Le secret est transmis uniquement côté serveur via headers.
  -- L'extension pg_net est fournie par Supabase.
  response := net.http_post(
    target_url || '/functions/v1/send-push',
    payload,
    jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(push_secret, '')
    )
  );

  -- Le trigger ne doit pas casser l'insert principal si le push échoue.
  -- On garde la notification métier mais on loggue côté serveur.
  IF response IS NULL THEN
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifications_push_trigger ON public.notifications;

CREATE TRIGGER notifications_push_trigger
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.notify_push_on_new_notification();
