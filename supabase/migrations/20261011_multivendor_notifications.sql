DO $$
BEGIN
  IF to_regclass('public.products') IS NULL
    OR to_regclass('public.orders') IS NULL
    OR to_regclass('public.order_items') IS NULL
    OR to_regclass('public.notifications') IS NULL
    OR to_regclass('public.push_subscriptions') IS NULL THEN
    RAISE EXCEPTION 'Multivendor migration requires products, orders, order_items, notifications and push_subscriptions';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'id'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'status'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name IN ('id', 'order_number', 'order_status', 'payment_status')
    GROUP BY table_name
    HAVING count(*) = 4
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name IN ('id', 'order_id', 'product_id')
    GROUP BY table_name
    HAVING count(*) = 3
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name IN ('id', 'title', 'message', 'type', 'is_read', 'metadata')
    GROUP BY table_name
    HAVING count(*) = 6
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'push_subscriptions' AND column_name IN ('id', 'user_id', 'endpoint', 'p256dh', 'auth')
    GROUP BY table_name
    HAVING count(*) = 5
  ) OR (
    SELECT count(*) FROM information_schema.columns
    WHERE table_schema = 'public'
      AND ((table_name = 'orders' AND column_name = 'id')
        OR (table_name = 'order_items' AND column_name IN ('order_id', 'product_id'))
          OR (table_name = 'products' AND column_name = 'id')
          OR (table_name = 'push_subscriptions' AND column_name = 'user_id'))
      AND data_type = 'uuid'
        ) <> 5 THEN
    RAISE EXCEPTION 'Multivendor migration found an unexpected existing table shape; inspect the live schema before applying';
  END IF;

END;
$$;

CREATE TABLE public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE RESTRICT,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  country text NOT NULL DEFAULT '',
  currency text NOT NULL DEFAULT 'XOF',
  language text NOT NULL DEFAULT 'French',
  timezone text NOT NULL DEFAULT 'Africa/Lome',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT stores_name_not_blank CHECK (length(btrim(name)) > 0),
  CONSTRAINT stores_slug_not_blank CHECK (length(btrim(slug)) > 0)
);

CREATE TABLE public.store_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE RESTRICT,
  order_status text NOT NULL CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status text NOT NULL CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_orders_order_store_unique UNIQUE (order_id, store_id)
);

ALTER TABLE public.products
  ADD COLUMN store_id uuid REFERENCES public.stores(id) ON DELETE RESTRICT;

ALTER TABLE public.order_items
  ADD COLUMN store_id uuid REFERENCES public.stores(id) ON DELETE RESTRICT;

ALTER TABLE public.notifications
  ADD COLUMN recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN dedupe_key text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.push_subscriptions'::regclass
      AND confrelid = 'auth.users'::regclass
      AND contype = 'f'
  ) THEN
    ALTER TABLE public.push_subscriptions
      ADD CONSTRAINT push_subscriptions_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
  END IF;
END;
$$;

UPDATE public.notifications AS notification
SET recipient_id = auth_user.id
FROM auth.users AS auth_user
WHERE notification.recipient_id IS NULL
  AND auth_user.id::text IN (
    notification.metadata->>'user_id',
    notification.metadata->>'userId'
  );

CREATE UNIQUE INDEX notifications_recipient_dedupe_key_idx
  ON public.notifications (recipient_id, dedupe_key)
  WHERE recipient_id IS NOT NULL AND dedupe_key IS NOT NULL;

CREATE INDEX products_store_id_idx ON public.products (store_id);
CREATE INDEX order_items_store_id_idx ON public.order_items (store_id);
CREATE INDEX store_orders_store_id_created_at_idx
  ON public.store_orders (store_id, created_at DESC);
CREATE INDEX store_orders_order_id_idx ON public.store_orders (order_id);
CREATE INDEX notifications_recipient_created_at_idx
  ON public.notifications (recipient_id, created_at DESC);
CREATE INDEX push_subscriptions_user_id_idx
  ON public.push_subscriptions (user_id);

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY stores_owner_select ON public.stores
  FOR SELECT TO authenticated USING (owner_id = (SELECT auth.uid()));
CREATE POLICY stores_owner_insert ON public.stores
  FOR INSERT TO authenticated WITH CHECK (owner_id = (SELECT auth.uid()));
CREATE POLICY stores_owner_update ON public.stores
  FOR UPDATE TO authenticated
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY store_orders_owner_select ON public.store_orders
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.stores AS store
    WHERE store.id = store_orders.store_id
      AND store.owner_id = (SELECT auth.uid())
  ));
CREATE POLICY store_orders_owner_update ON public.store_orders
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.stores AS store
    WHERE store.id = store_orders.store_id
      AND store.owner_id = (SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.stores AS store
    WHERE store.id = store_orders.store_id
      AND store.owner_id = (SELECT auth.uid())
  ));

CREATE POLICY products_public_published_select ON public.products
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY products_owner_select ON public.products
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.stores AS store
    WHERE store.id = products.store_id
      AND store.owner_id = (SELECT auth.uid())
  ));
CREATE POLICY products_owner_insert ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.stores AS store
    WHERE store.id = products.store_id
      AND store.owner_id = (SELECT auth.uid())
  ));
CREATE POLICY products_owner_update ON public.products
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.stores AS store
    WHERE store.id = products.store_id
      AND store.owner_id = (SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.stores AS store
    WHERE store.id = products.store_id
      AND store.owner_id = (SELECT auth.uid())
  ));
CREATE POLICY products_owner_delete ON public.products
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.stores AS store
    WHERE store.id = products.store_id
      AND store.owner_id = (SELECT auth.uid())
  ));

CREATE POLICY order_items_owner_select ON public.order_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.stores AS store
    WHERE store.id = order_items.store_id
      AND store.owner_id = (SELECT auth.uid())
  ));

CREATE POLICY notifications_recipient_select ON public.notifications
  FOR SELECT TO authenticated USING (recipient_id = (SELECT auth.uid()));
CREATE POLICY notifications_recipient_update ON public.notifications
  FOR UPDATE TO authenticated
  USING (recipient_id = (SELECT auth.uid()))
  WITH CHECK (recipient_id = (SELECT auth.uid()));
CREATE POLICY notifications_recipient_delete ON public.notifications
  FOR DELETE TO authenticated USING (recipient_id = (SELECT auth.uid()));

CREATE POLICY push_subscriptions_owner_select ON public.push_subscriptions
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY push_subscriptions_owner_insert ON public.push_subscriptions
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY push_subscriptions_owner_update ON public.push_subscriptions
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY push_subscriptions_owner_delete ON public.push_subscriptions
  FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE POLICY stores_scope_guard ON public.stores
  AS RESTRICTIVE FOR ALL TO public
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));
CREATE POLICY store_orders_scope_guard ON public.store_orders
  AS RESTRICTIVE FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM public.stores AS store
    WHERE store.id = store_orders.store_id
      AND store.owner_id = (SELECT auth.uid())
  ));
CREATE POLICY store_orders_update_scope_guard ON public.store_orders
  AS RESTRICTIVE FOR UPDATE TO public
  USING (EXISTS (
    SELECT 1 FROM public.stores AS store
    WHERE store.id = store_orders.store_id
      AND store.owner_id = (SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.stores AS store
    WHERE store.id = store_orders.store_id
      AND store.owner_id = (SELECT auth.uid())
  ));
CREATE POLICY store_orders_insert_scope_guard ON public.store_orders
  AS RESTRICTIVE FOR INSERT TO public WITH CHECK (false);
CREATE POLICY store_orders_delete_scope_guard ON public.store_orders
  AS RESTRICTIVE FOR DELETE TO public USING (false);
CREATE POLICY products_select_scope_guard ON public.products
  AS RESTRICTIVE FOR SELECT TO public
  USING (
    status = 'published'
    OR EXISTS (
      SELECT 1 FROM public.stores AS store
      WHERE store.id = products.store_id
        AND store.owner_id = (SELECT auth.uid())
    )
  );
CREATE POLICY products_insert_scope_guard ON public.products
  AS RESTRICTIVE FOR INSERT TO public
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.stores AS store
    WHERE store.id = products.store_id
      AND store.owner_id = (SELECT auth.uid())
  ));
CREATE POLICY products_update_scope_guard ON public.products
  AS RESTRICTIVE FOR UPDATE TO public
  USING (EXISTS (
    SELECT 1 FROM public.stores AS store
    WHERE store.id = products.store_id
      AND store.owner_id = (SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.stores AS store
    WHERE store.id = products.store_id
      AND store.owner_id = (SELECT auth.uid())
  ));
CREATE POLICY products_delete_scope_guard ON public.products
  AS RESTRICTIVE FOR DELETE TO public
  USING (EXISTS (
    SELECT 1 FROM public.stores AS store
    WHERE store.id = products.store_id
      AND store.owner_id = (SELECT auth.uid())
  ));
CREATE POLICY order_items_select_scope_guard ON public.order_items
  AS RESTRICTIVE FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM public.stores AS store
    WHERE store.id = order_items.store_id
      AND store.owner_id = (SELECT auth.uid())
  ));
CREATE POLICY order_items_insert_scope_guard ON public.order_items
  AS RESTRICTIVE FOR INSERT TO public WITH CHECK (false);
CREATE POLICY order_items_update_scope_guard ON public.order_items
  AS RESTRICTIVE FOR UPDATE TO public USING (false) WITH CHECK (false);
CREATE POLICY order_items_delete_scope_guard ON public.order_items
  AS RESTRICTIVE FOR DELETE TO public USING (false);
CREATE POLICY orders_select_scope_guard ON public.orders
  AS RESTRICTIVE FOR SELECT TO public USING (false);
CREATE POLICY orders_insert_scope_guard ON public.orders
  AS RESTRICTIVE FOR INSERT TO public WITH CHECK (false);
CREATE POLICY orders_update_scope_guard ON public.orders
  AS RESTRICTIVE FOR UPDATE TO public USING (false) WITH CHECK (false);
CREATE POLICY orders_delete_scope_guard ON public.orders
  AS RESTRICTIVE FOR DELETE TO public USING (false);
CREATE POLICY notifications_select_scope_guard ON public.notifications
  AS RESTRICTIVE FOR SELECT TO public
  USING (recipient_id = (SELECT auth.uid()));
CREATE POLICY notifications_insert_scope_guard ON public.notifications
  AS RESTRICTIVE FOR INSERT TO public WITH CHECK (false);
CREATE POLICY notifications_update_scope_guard ON public.notifications
  AS RESTRICTIVE FOR UPDATE TO public
  USING (recipient_id = (SELECT auth.uid()))
  WITH CHECK (recipient_id = (SELECT auth.uid()));
CREATE POLICY notifications_delete_scope_guard ON public.notifications
  AS RESTRICTIVE FOR DELETE TO public
  USING (recipient_id = (SELECT auth.uid()));
CREATE POLICY push_subscriptions_scope_guard ON public.push_subscriptions
  AS RESTRICTIVE FOR ALL TO public
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.stores TO authenticated;
GRANT SELECT ON public.store_orders TO authenticated;
GRANT UPDATE (order_status) ON public.store_orders TO authenticated;
GRANT SELECT, DELETE ON public.notifications TO authenticated;
GRANT UPDATE (is_read) ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;

CREATE VIEW public.vendor_orders WITH (security_barrier = true) AS
SELECT
  parent.id,
  parent.order_number,
  parent.customer_name,
  parent.customer_phone,
  parent.shipping_address,
  parent.city,
  COALESCE(sum(item.unit_price * item.quantity), 0) AS total_amount,
  parent.currency,
  parent.payment_method,
  store_order.payment_status,
  store_order.order_status,
  parent.notes,
  parent.created_at
FROM public.store_orders AS store_order
JOIN public.stores AS store ON store.id = store_order.store_id
JOIN public.orders AS parent ON parent.id = store_order.order_id
LEFT JOIN public.order_items AS item
  ON item.order_id = store_order.order_id
  AND item.store_id = store_order.store_id
WHERE store.owner_id = (SELECT auth.uid())
GROUP BY
  parent.id,
  parent.order_number,
  parent.customer_name,
  parent.customer_phone,
  parent.shipping_address,
  parent.city,
  parent.currency,
  parent.payment_method,
  store_order.payment_status,
  store_order.order_status,
  parent.notes,
  parent.created_at;

REVOKE ALL ON public.vendor_orders FROM PUBLIC, anon;
GRANT SELECT ON public.vendor_orders TO authenticated;

CREATE VIEW public.public_product_sales AS
SELECT item.product_id, sum(item.quantity)::bigint AS quantity
FROM public.order_items AS item
JOIN public.orders AS parent ON parent.id = item.order_id
JOIN public.products AS product ON product.id = item.product_id
WHERE parent.order_status = 'delivered'
  AND product.status = 'published'
GROUP BY item.product_id;

REVOKE ALL ON public.public_product_sales FROM PUBLIC;
GRANT SELECT ON public.public_product_sales TO anon, authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
    AND NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'store_orders'
    ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.store_orders';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.finalize_order_vendor_notifications(
  p_order_id uuid,
  p_expected_item_count integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  parent_order public.orders%ROWTYPE;
  item_count bigint;
BEGIN
  SELECT * INTO STRICT parent_order
  FROM public.orders
  WHERE id = p_order_id;

  SELECT count(*) INTO item_count
  FROM public.order_items
  WHERE order_id = p_order_id;

  IF p_expected_item_count IS NULL
    OR p_expected_item_count <= 0
    OR item_count <> p_expected_item_count THEN
    RAISE EXCEPTION 'Cannot finalize a vendor order until all expected items exist';
  END IF;

  UPDATE public.order_items AS item
  SET store_id = product.store_id
  FROM public.products AS product
  WHERE item.order_id = p_order_id
    AND item.product_id = product.id
    AND item.store_id IS NULL
    AND product.store_id IS NOT NULL;

  INSERT INTO public.store_orders (order_id, store_id, order_status, payment_status)
  SELECT DISTINCT p_order_id, item.store_id, parent_order.order_status, parent_order.payment_status
  FROM public.order_items AS item
  JOIN public.stores AS store ON store.id = item.store_id
  WHERE item.order_id = p_order_id
  ON CONFLICT (order_id, store_id) DO NOTHING;

  INSERT INTO public.notifications (
    recipient_id, title, message, type, is_read, metadata, dedupe_key
  )
  SELECT
    store.owner_id,
    'Nouvelle commande #' || COALESCE(parent_order.order_number::text, p_order_id::text),
    'Une nouvelle commande concerne votre boutique.',
    'order',
    false,
    jsonb_build_object(
      'order_id', p_order_id,
      'store_order_ids', jsonb_agg(DISTINCT store_order.id)
    ),
    'order:' || p_order_id::text
  FROM public.store_orders AS store_order
  JOIN public.stores AS store ON store.id = store_order.store_id
  WHERE store_order.order_id = p_order_id
  GROUP BY store.owner_id
  ON CONFLICT (recipient_id, dedupe_key)
    WHERE recipient_id IS NOT NULL AND dedupe_key IS NOT NULL
    DO NOTHING;
END;
$$;

ALTER FUNCTION public.finalize_order_vendor_notifications(uuid, integer) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.finalize_order_vendor_notifications(uuid, integer)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.finalize_order_vendor_notifications(uuid, integer) TO service_role;

CREATE OR REPLACE FUNCTION public.notify_push_for_recipient_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  target_url text;
  push_secret text;
  publishable_key text;
BEGIN
  IF NEW.recipient_id IS NULL OR NEW.type NOT IN ('order', 'payment') THEN
    RETURN NEW;
  END IF;

  SELECT decrypted_secret INTO target_url
  FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL';
  SELECT decrypted_secret INTO push_secret
  FROM vault.decrypted_secrets WHERE name = 'PUSH_WEBHOOK_SECRET';
  SELECT decrypted_secret INTO publishable_key
  FROM vault.decrypted_secrets WHERE name = 'SUPABASE_PUBLISHABLE_KEY';

  IF COALESCE(target_url, '') !~* '^https://[^/]+/?$'
    OR COALESCE(push_secret, '') = ''
    OR left(COALESCE(publishable_key, ''), 15) <> 'sb_publishable_' THEN
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := rtrim(target_url, '/') || '/functions/v1/send-push',
    body := jsonb_build_object('notification_id', NEW.id),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', publishable_key,
      'Authorization', 'Bearer ' || push_secret
    ),
    timeout_milliseconds := 5000
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Push enqueue failed; internal notification retained.';
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.notify_push_for_recipient_notification() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.notify_push_for_recipient_notification()
  FROM PUBLIC, anon, authenticated, service_role;

ALTER FUNCTION public.notify_push_on_new_notification() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.notify_push_on_new_notification()
  FROM PUBLIC, anon, authenticated, service_role;

DROP TRIGGER IF EXISTS notifications_push_trigger ON public.notifications;
DROP TRIGGER IF EXISTS orders_push_trigger ON public.orders;

CREATE TRIGGER notifications_push_trigger
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.notify_push_for_recipient_notification();

CREATE OR REPLACE FUNCTION public.notify_vendor_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  parent_order_number text;
BEGIN
  IF OLD.order_status IS NOT DISTINCT FROM NEW.order_status THEN
    RETURN NEW;
  END IF;

  SELECT order_number::text INTO parent_order_number
  FROM public.orders WHERE id = NEW.order_id;

  INSERT INTO public.notifications (
    recipient_id, title, message, type, is_read, metadata, dedupe_key
  )
  SELECT store.owner_id,
    'Statut de commande modifié',
    'La sous-commande #' || COALESCE(parent_order_number, NEW.order_id::text)
      || ' est maintenant : ' || NEW.order_status || '.',
    'order', false,
    jsonb_build_object('order_id', NEW.order_id, 'store_order_id', NEW.id),
    'status:' || NEW.id::text || ':' || NEW.order_status || ':' || txid_current()::text
  FROM public.stores AS store
  WHERE store.id = NEW.store_id
  ON CONFLICT (recipient_id, dedupe_key)
    WHERE recipient_id IS NOT NULL AND dedupe_key IS NOT NULL
    DO NOTHING;

  RETURN NEW;
END;
$$;

ALTER FUNCTION public.notify_vendor_order_status_change() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.notify_vendor_order_status_change()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER store_orders_status_notification_trigger
AFTER UPDATE OF order_status ON public.store_orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_vendor_order_status_change();

CREATE OR REPLACE FUNCTION public.protect_store_order_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.order_id IS DISTINCT FROM OLD.order_id
    OR NEW.store_id IS DISTINCT FROM OLD.store_id
    OR (NEW.payment_status IS DISTINCT FROM OLD.payment_status AND current_user <> 'postgres')
    OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Only the order status can be changed by a store owner';
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.protect_store_order_fields() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.protect_store_order_fields()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER store_orders_protect_fields_trigger
BEFORE UPDATE ON public.store_orders
FOR EACH ROW
EXECUTE FUNCTION public.protect_store_order_fields();

CREATE OR REPLACE FUNCTION public.sync_vendor_payment_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF OLD.payment_status IS NOT DISTINCT FROM NEW.payment_status THEN
    RETURN NEW;
  END IF;

  UPDATE public.store_orders
  SET payment_status = NEW.payment_status,
      updated_at = now()
  WHERE order_id = NEW.id;

  INSERT INTO public.notifications (
    recipient_id, title, message, type, is_read, metadata, dedupe_key
  )
  SELECT store.owner_id,
    'Paiement de commande modifié',
    'Le paiement de la commande #' || COALESCE(NEW.order_number::text, NEW.id::text)
      || ' est maintenant : ' || NEW.payment_status || '.',
    'payment', false,
    jsonb_build_object('order_id', NEW.id),
    'payment:' || NEW.id::text || ':' || NEW.payment_status || ':' || txid_current()::text
  FROM public.store_orders AS store_order
  JOIN public.stores AS store ON store.id = store_order.store_id
  WHERE store_order.order_id = NEW.id
  GROUP BY store.owner_id
  ON CONFLICT (recipient_id, dedupe_key)
    WHERE recipient_id IS NOT NULL AND dedupe_key IS NOT NULL
    DO NOTHING;

  RETURN NEW;
END;
$$;

ALTER FUNCTION public.sync_vendor_payment_status() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.sync_vendor_payment_status()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER orders_vendor_payment_notification_trigger
AFTER UPDATE OF payment_status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.sync_vendor_payment_status();

CREATE OR REPLACE FUNCTION public.dispatch_order_push(
  recipient_user_id text,
  notification_title text,
  notification_body text,
  order_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF order_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    PERFORM public.finalize_order_vendor_notifications(
      order_id::uuid,
      (SELECT count(*)::integer
       FROM public.order_items AS item
       WHERE item.order_id = order_id::uuid)
    );
  END IF;
END;
$$;

ALTER FUNCTION public.dispatch_order_push(text, text, text, text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.dispatch_order_push(text, text, text, text)
  FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON vault.decrypted_secrets FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON TABLE net.http_request_queue FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION net.http_post(text, jsonb, jsonb, jsonb, integer)
  FROM PUBLIC, anon, authenticated, service_role;