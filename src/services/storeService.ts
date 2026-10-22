import { supabase } from "@/lib/supabase";
import type {
  StoreFormValues,
  StoreProductPreview,
  StoreRecord,
  StoreStatus,
} from "@/types/store";

const STORE_COLUMNS =
  "id, owner_id, name, slug, country, currency, language, timezone, status, created_at, updated_at";

const requireUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;
  if (!data.user) throw new Error("Connectez-vous pour gérer votre boutique.");

  return data.user;
};

export interface StoreDashboardData {
  store: StoreRecord | null;
  productCount: number;
  publishedProducts: StoreProductPreview[];
}
export const loadStoreDashboard = async (storeSlug?: string): Promise<StoreDashboardData> => {
  const user = await requireUser();
  
  let query = supabase.from("stores").select(STORE_COLUMNS);
  if (storeSlug) {
    query = query.eq("slug", storeSlug);
  } else {
    query = query.eq("owner_id", user.id);
  }

  const { data, error } = await query.maybeSingle();

  if (error) throw new Error(`Impossible de charger la boutique : ${error.message}`);
  if (!data) return { store: null, productCount: 0, publishedProducts: [] };

  const store = data as unknown as StoreRecord;
  const [countResult, productsResult] = await Promise.all([
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("store_id", store.id),
    supabase
      .from("products")
      .select("id, name, description, price, currency, status")
      .eq("store_id", store.id)
      .eq("status", "published")
      .order("created_at", { ascending: false }),
  ]);

  if (countResult.error) {
    throw new Error(`Impossible de compter les produits : ${countResult.error.message}`);
  }
  if (productsResult.error) {
    throw new Error(`Impossible de prévisualiser les produits : ${productsResult.error.message}`);
  }

  return {
    store,
    productCount: countResult.count ?? 0,
    publishedProducts: (productsResult.data ?? []) as StoreProductPreview[],
  };
};

export const saveStoreInformation = async (
  storeId: string | null,
  values: StoreFormValues,
): Promise<StoreRecord> => {
  const user = await requireUser();

  if (storeId) {
    const { data, error } = await supabase
      .from("stores")
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq("id", storeId)
      .eq("owner_id", user.id)
      .select(STORE_COLUMNS)
      .maybeSingle();

    if (error) throw new Error(`Impossible d'enregistrer la boutique : ${error.message}`);
    if (!data) throw new Error("Boutique introuvable ou accès refusé.");

    return data as unknown as StoreRecord;
  }

  const { data, error } = await supabase
    .from("stores")
    .insert({ ...values, owner_id: user.id, status: "inactive" })
    .select(STORE_COLUMNS)
    .single();

  if (error) throw new Error(`Impossible de créer la boutique : ${error.message}`);

  return data as unknown as StoreRecord;
};

export const updateStoreStatus = async (
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
  if (!data) throw new Error("Boutique introuvable ou accès refusé.");

  return data as unknown as StoreRecord;
};