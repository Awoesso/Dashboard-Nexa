import { useEffect, useState } from "react";
import {
  loadStoreDashboard,
  saveStoreInformation,
  updateStoreStatus,
} from "@/services/storeService";
import type {
  StoreDesign,
  StoreFieldErrors,
  StoreFormValues,
  StoreProductPreview,
  StoreRecord,
  StoreTemplateId,
} from "@/types/store";

const EMPTY_FORM: StoreFormValues = {
  name: "",
  slug: "",
  country: "Togo",
  currency: "XOF",
  language: "French",
  timezone: "Africa/Lome",
};

const DEFAULT_DESIGN: StoreDesign = {
  primaryColor: "#1f2937",
  accentColor: "#e0a458",
};

export const useStore = () => {
  const [store, setStore] = useState<StoreRecord | null>(null);
  const [form, setForm] = useState<StoreFormValues>(EMPTY_FORM);
  const [productCount, setProductCount] = useState(0);
  const [publishedProducts, setPublishedProducts] = useState<StoreProductPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<StoreFieldErrors>({});
  const [template, setTemplate] = useState<StoreTemplateId>("atelier");
  const [design, setDesign] = useState<StoreDesign>(DEFAULT_DESIGN);

  useEffect(() => {
    let active = true;

    void loadStoreDashboard()
      .then((result) => {
        if (!active) return;
        setStore(result.store);
        setProductCount(result.productCount);
        setPublishedProducts(result.publishedProducts);
        if (result.store) {
          setForm({
            name: result.store.name,
            slug: result.store.slug,
            country: result.store.country,
            currency: result.store.currency,
            language: result.store.language,
            timezone: result.store.timezone,
          });
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Impossible de charger votre boutique.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const updateForm = <Key extends keyof StoreFormValues>(
    key: Key,
    value: StoreFormValues[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setMessage(null);
  };

  const validate = () => {
    const nextErrors: StoreFieldErrors = {};
    if (!form.name.trim()) nextErrors.name = "Le nom est obligatoire.";
    if (!form.slug.trim()) {
      nextErrors.slug = "L’adresse de la boutique est obligatoire.";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
      nextErrors.slug = "Utilisez des lettres minuscules, chiffres et tirets.";
    }
    if (!form.country.trim()) nextErrors.country = "Le pays est obligatoire.";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const save = async () => {
    setError(null);
    setMessage(null);
    if (!validate()) return false;

    setSaving(true);
    try {
      const savedStore = await saveStoreInformation(store?.id ?? null, {
        ...form,
        name: form.name.trim(),
        slug: form.slug.trim(),
      });
      setStore(savedStore);
      setForm({
        name: savedStore.name,
        slug: savedStore.slug,
        country: savedStore.country,
        currency: savedStore.currency,
        language: savedStore.language,
        timezone: savedStore.timezone,
      });
      setMessage("Informations enregistrées.");
      return true;
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : "Enregistrement impossible.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const setPublished = async (published: boolean) => {
    setError(null);
    setMessage(null);
    if (!store) {
      setError("Créez d’abord votre boutique et enregistrez ses informations.");
      return false;
    }
    if (published) {
      if (!validate()) {
        setError("Corrigez les informations obligatoires avant l’activation.");
        return false;
      }
      if (publishedProducts.length === 0) {
        setError("Publiez au moins un produit avant l’activation.");
        return false;
      }
      const hasUnsavedInformation =
        store.name !== form.name.trim() ||
        store.slug !== form.slug.trim() ||
        store.country !== form.country ||
        store.currency !== form.currency ||
        store.language !== form.language ||
        store.timezone !== form.timezone;

      if (hasUnsavedInformation) {
        setError("Enregistrez les informations modifiées avant l’activation.");
        return false;
      }
    }

    setSaving(true);
    try {
      const updated = await updateStoreStatus(store.id, published ? "active" : "inactive");
      setStore(updated);
      setMessage(published ? "Boutique activée." : "Boutique désactivée.");
      return true;
    } catch (statusError: unknown) {
      setError(statusError instanceof Error ? statusError.message : "Modification du statut impossible.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    store,
    form,
    updateForm,
    productCount,
    publishedProducts,
    loading,
    saving,
    error,
    message,
    fieldErrors,
    save,
    setPublished,
    template,
    setTemplate,
    design,
    setDesign,
  };
};