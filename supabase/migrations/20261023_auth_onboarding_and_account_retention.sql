DO $$
BEGIN
  IF to_regclass('public.stores') IS NULL
    OR to_regclass('public.store_settings') IS NULL THEN
    RAISE EXCEPTION 'Account onboarding requires public.stores and public.store_settings';
  END IF;

  IF to_regclass('public.profiles') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.profiles AS profile
      WHERE NOT EXISTS (
        SELECT 1 FROM auth.users AS auth_user WHERE auth_user.id = profile.id
      )
    ) THEN
      RAISE EXCEPTION 'Orphan profiles exist; review them before applying account retention';
    END IF;
  END IF;
END;
$$;

ALTER TABLE public.stores ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.stores DROP CONSTRAINT IF EXISTS stores_owner_id_fkey;
ALTER TABLE public.stores
  ADD CONSTRAINT stores_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  first_name text,
  last_name text,
  avatar_url text,
  phone text,
  store_name text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE UNIQUE INDEX IF NOT EXISTS profiles_id_unique_idx ON public.profiles (id);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_owner_select ON public.profiles;
CREATE POLICY profiles_owner_select ON public.profiles
  FOR SELECT TO authenticated USING (id = (SELECT auth.uid()));
DROP POLICY IF EXISTS profiles_owner_update ON public.profiles;
CREATE POLICY profiles_owner_update ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));
DROP POLICY IF EXISTS profiles_owner_scope_guard ON public.profiles;
CREATE POLICY profiles_owner_scope_guard ON public.profiles
  AS RESTRICTIVE FOR ALL TO public
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

DO $$
DECLARE
  foreign_key record;
BEGIN
  FOR foreign_key IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND confrelid = 'auth.users'::regclass
      AND contype = 'f'
  LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', foreign_key.conname);
  END LOOP;

  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_id_auth_users_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
END;
$$;

CREATE OR REPLACE FUNCTION public.initialize_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  first_name text := NULLIF(btrim(COALESCE(NEW.raw_user_meta_data ->> 'first_name', '')), '');
  last_name text := NULLIF(btrim(COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')), '');
  full_name text := NULLIF(btrim(COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')), '');
  created_store_id uuid;
BEGIN
  IF first_name IS NULL AND full_name IS NOT NULL THEN
    first_name := split_part(full_name, ' ', 1);
  END IF;

  IF last_name IS NULL AND full_name IS NOT NULL THEN
    last_name := NULLIF(btrim(substr(full_name, length(split_part(full_name, ' ', 1)) + 1)), '');
  END IF;

  INSERT INTO public.profiles (id, first_name, last_name, store_name, created_at, updated_at)
  VALUES (
    NEW.id,
    first_name,
    last_name,
    COALESCE(NULLIF(btrim(first_name || ' ' || COALESCE(last_name, '')), ''), 'Ma boutique'),
    now(),
    now()
  )
  ON CONFLICT DO NOTHING;

  INSERT INTO public.stores (owner_id, name, slug, country, currency, language, timezone)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(btrim(first_name || ' ' || COALESCE(last_name, '')), ''), 'Ma boutique'),
    'store-' || replace(NEW.id::text, '-', ''),
    '',
    'XOF',
    'French',
    'Africa/Lome'
  )
  ON CONFLICT (owner_id) DO NOTHING
  RETURNING id INTO created_store_id;

  IF created_store_id IS NOT NULL THEN
    INSERT INTO public.store_settings (store_id)
    VALUES (created_store_id)
    ON CONFLICT (store_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_initialize_profile_store ON auth.users;
CREATE TRIGGER on_auth_user_created_initialize_profile_store
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.initialize_auth_user();

CREATE OR REPLACE FUNCTION public.archive_store_before_auth_user_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.stores
  SET owner_id = NULL,
      status = 'inactive',
      updated_at = now()
  WHERE owner_id = OLD.id;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS archive_store_before_auth_user_delete ON auth.users;
CREATE TRIGGER archive_store_before_auth_user_delete
BEFORE DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.archive_store_before_auth_user_delete();

CREATE OR REPLACE FUNCTION public.authenticated_mfa_requirement_met()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    COALESCE(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
    OR NOT EXISTS (
      SELECT 1
      FROM auth.mfa_factors AS factor
      WHERE factor.user_id = auth.uid()
        AND factor.status = 'verified'
    );
$$;

REVOKE ALL ON FUNCTION public.authenticated_mfa_requirement_met() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.authenticated_mfa_requirement_met() TO authenticated;

DO $$
DECLARE
  relation_name text;
BEGIN
  FOREACH relation_name IN ARRAY ARRAY[
    'profiles',
    'stores',
    'store_settings',
    'products',
    'orders',
    'order_items',
    'store_orders',
    'product_images',
    'product_files',
    'notifications',
    'push_subscriptions'
  ] LOOP
    IF to_regclass(format('public.%I', relation_name)) IS NOT NULL THEN
      EXECUTE format(
        'DROP POLICY IF EXISTS mfa_assurance_guard ON public.%I',
        relation_name
      );
      EXECUTE format(
        'CREATE POLICY mfa_assurance_guard ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (public.authenticated_mfa_requirement_met()) WITH CHECK (public.authenticated_mfa_requirement_met())',
        relation_name
      );
    END IF;
  END LOOP;
END;
$$;

INSERT INTO public.profiles (id, first_name, last_name, created_at, updated_at)
SELECT
  auth_user.id,
  NULLIF(btrim(COALESCE(auth_user.raw_user_meta_data ->> 'first_name', '')), ''),
  NULLIF(btrim(COALESCE(auth_user.raw_user_meta_data ->> 'last_name', '')), ''),
  now(),
  now()
FROM auth.users AS auth_user
ON CONFLICT DO NOTHING;

INSERT INTO public.stores (owner_id, name, slug, country, currency, language, timezone)
SELECT
  auth_user.id,
  COALESCE(
    NULLIF(btrim(COALESCE(auth_user.raw_user_meta_data ->> 'first_name', auth_user.raw_user_meta_data ->> 'full_name', '')), ''),
    'Ma boutique'
  ),
  'store-' || replace(auth_user.id::text, '-', ''),
  '',
  'XOF',
  'French',
  'Africa/Lome'
FROM auth.users AS auth_user
ON CONFLICT (owner_id) DO NOTHING;

INSERT INTO public.store_settings (store_id)
SELECT store.id
FROM public.stores AS store
WHERE store.owner_id IS NOT NULL
ON CONFLICT (store_id) DO NOTHING;

DROP POLICY IF EXISTS products_select_scope_guard ON public.products;
CREATE POLICY products_select_scope_guard ON public.products
  AS RESTRICTIVE FOR SELECT TO public
  USING (
    (
      status = 'published'
      AND (
        store_id IS NULL
        OR EXISTS (
          SELECT 1 FROM public.stores AS store
          WHERE store.id = products.store_id
            AND store.status = 'active'
        )
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.stores AS store
      WHERE store.id = products.store_id
        AND store.owner_id = (SELECT auth.uid())
    )
  );
