DO $$
BEGIN
  IF to_regclass('public.stores') IS NULL THEN
    RAISE EXCEPTION 'store_settings requires public.stores';
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.store_settings (
  store_id uuid PRIMARY KEY REFERENCES public.stores(id) ON DELETE CASCADE,
  template text NOT NULL DEFAULT 'general' CHECK (template IN ('fashion', 'tech', 'general')),
  primary_color text NOT NULL DEFAULT '#1f2937',
  accent_color text NOT NULL DEFAULT '#e0a458',
  country_code text NOT NULL DEFAULT 'TG',
  dial_code text NOT NULL DEFAULT '+228',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY store_settings_owner_select ON public.store_settings
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.stores AS store
    WHERE store.id = store_settings.store_id
      AND store.owner_id = (SELECT auth.uid())
  ));

CREATE POLICY store_settings_owner_insert ON public.store_settings
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.stores AS store
    WHERE store.id = store_settings.store_id
      AND store.owner_id = (SELECT auth.uid())
  ));

CREATE POLICY store_settings_owner_update ON public.store_settings
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.stores AS store
    WHERE store.id = store_settings.store_id
      AND store.owner_id = (SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.stores AS store
    WHERE store.id = store_settings.store_id
      AND store.owner_id = (SELECT auth.uid())
  ));

CREATE POLICY store_settings_scope_guard ON public.store_settings
  AS RESTRICTIVE FOR ALL TO public
  USING (EXISTS (
    SELECT 1 FROM public.stores AS store
    WHERE store.id = store_settings.store_id
      AND store.owner_id = (SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.stores AS store
    WHERE store.id = store_settings.store_id
      AND store.owner_id = (SELECT auth.uid())
  ));

GRANT SELECT, INSERT, UPDATE ON public.store_settings TO authenticated;
