import { supabase } from "@/lib/supabase";
import { findStoreCountry } from "@/data/storeCountries";
import type {
  DskStoreTemplateId,
  StoreProductPreview,
  StoreRecord,
  StoreSettingsDraft,
  StoreStatus,
} from "@/types/store";

const STORE_COLUMNS =
  "id, owner_id, name, slug, country, currency, language, timezone, status, created_at, updated_at";

const SETTINGS_COLUMNS =
  "store_id, template, primary_color, accent_color, country_code, dial_code, updated_at";

const DEFAULT_SETTINGS: StoreSettingsDraft = {
  template: "general",
  primaryColor: "#1f2937",
  accentColor: "#e0a458",
  countryCode: "TG",
  dialCode: "+228",
};

const requireUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Connectez-vous pour gérer votre boutique.");
  return data.user;
};

const isMissingSettingsTable = (error: { code?: string; message?: string }) =>
  error.code === "PGRST205" ||
  error.code === "42P01" ||
  /store_settings/i.test(error.message ?? "");

const asTemplate = (value: string | null | undefined): DskStoreTemplateId =>
  value === "fashion" || value === "tech" || value === "general" ? value : "general";

const settingsFromRow = (
  row: {
    template: string;
    primary_color: string;
    accent_color: string;
    country_code: string;
    dial_code: string;
  } | null,
  store: StoreRecord,
): StoreSettingsDraft => {
  if (!row) {
    const country = findStoreCountry(store.country);
    return {
      ...DEFAULT_SETTINGS,
      countryCode: country.code,
      dialCode: country.dialCode,
    };
  }

  return {
    template: asTemplate(row.template),
    primaryColor: row.primary_color || DEFAULT_SETTINGS.primaryColor,
    accentColor: row.accent_color || DEFAULT_SETTINGS.accentColor,
    countryCode: row.country_code || DEFAULT_SETTINGS.countryCode,
    dialCode: row.dial_code || DEFAULT_SETTINGS.dialCode,
  };
};

export class StoreEditorAccessError extends Error {
  constructor(message = "Vous n’êtes pas autorisé à modifier cette boutique.") {
    super(message);
    this.name = "StoreEditorAccessError";
  }
}

export class StoreEditorNotFoundError extends Error {
  constructor(message = "Boutique introuvable.") {
    super(message);
    this.name = "StoreEditorNotFoundError";
  }
}

export interface StoreEditorPayload {
  store: StoreRecord;
  settings: StoreSettingsDraft;
  publishedProducts: StoreProductPreview[];
  settingsPersisted: boolean;
}

export const loadStoreEditor = async (slug: string): Promise<StoreEditorPayload> => {
  const user = await requireUser();
  const normalizedSlug = slug.trim();

  const { data, error } = await supabase
    .from("stores")
    .select(STORE_COLUMNS)
    .eq("slug", normalizedSlug)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) throw new Error(`Impossible de charger la boutique : ${error.message}`);
  if (!data) {
    throw new StoreEditorNotFoundError(
      "Boutique introuvable ou vous n’êtes pas le propriétaire.",
    );
  }

  const store = data as StoreRecord;
  if (store.owner_id !== user.id) throw new StoreEditorAccessError();

  const [settingsResult, productsResult] = await Promise.all([
    supabase
      .from("store_settings")
      .select(SETTINGS_COLUMNS)
      .eq("store_id", store.id)
      .maybeSingle(),
    supabase
      .from("products")
      .select("id, name, description, price, currency, status")
      .eq("store_id", store.id)
      .eq("status", "published")
      .order("created_at", { ascending: false }),
  ]);

  let settingsPersisted = true;
  if (settingsResult.error) {
    if (!isMissingSettingsTable(settingsResult.error)) {
      throw new Error(`Impossible de charger le thème : ${settingsResult.error.message}`);
    }
    settingsPersisted = false;
  }

  if (productsResult.error) {
    throw new Error(`Impossible de prévisualiser les produits : ${productsResult.error.message}`);
  }

  return {
    store,
    settings: settingsFromRow(settingsResult.data, store),
    publishedProducts: (productsResult.data ?? []) as StoreProductPreview[],
    settingsPersisted,
  };
};

export const saveStoreCustomization = async (
  storeId: string,
  settings: StoreSettingsDraft,
): Promise<{ store: StoreRecord; settings: StoreSettingsDraft; settingsPersisted: boolean }> => {
  const user = await requireUser();
  const country = findStoreCountry(settings.countryCode);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("stores")
    .update({
      country: country.name,
      currency: country.currency,
      language: country.language,
      timezone: country.timezone,
      updated_at: now,
    })
    .eq("id", storeId)
    .eq("owner_id", user.id)
    .select(STORE_COLUMNS)
    .maybeSingle();

  if (error) throw new Error(`Impossible d’enregistrer la boutique : ${error.message}`);
  if (!data) throw new StoreEditorAccessError();

  const store = data as StoreRecord;
  const payload = {
    store_id: storeId,
    template: settings.template,
    primary_color: settings.primaryColor,
    accent_color: settings.accentColor,
    country_code: country.code,
    dial_code: country.dialCode,
    updated_at: now,
  };

  const { error: settingsError } = await supabase.from("store_settings").upsert(payload, {
    onConflict: "store_id",
  });

  if (settingsError) {
    if (!isMissingSettingsTable(settingsError)) {
      throw new Error(`Impossible d’enregistrer le thème : ${settingsError.message}`);
    }

    return {
      store,
      settings: { ...settings, countryCode: country.code, dialCode: country.dialCode },
      settingsPersisted: false,
    };
  }

  return {
    store,
    settings: { ...settings, countryCode: country.code, dialCode: country.dialCode },
    settingsPersisted: true,
  };
};

export const publishStoreEditor = async (
  storeId: string,
  status: StoreStatus,
): Promise<StoreRecord> => {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("stores")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", storeId)
    .eq("owner_id", user.id)
    .select(STORE_COLUMNS)
    .maybeSingle();

  if (error) throw new Error(`Impossible de modifier le statut : ${error.message}`);
  if (!data) throw new StoreEditorAccessError();
  return data as StoreRecord;
};
