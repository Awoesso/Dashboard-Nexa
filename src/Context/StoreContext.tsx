import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { findStoreCountry } from "@/data/storeCountries";
import {
  publishStoreEditor,
  saveStoreCustomization,
  type StoreEditorPayload,
} from "@/services/storeEditor.service";
import type {
  DskStoreTemplateId,
  StoreProductPreview,
  StoreRecord,
  StoreSettingsDraft,
} from "@/types/store";

type StoreContextValue = {
  store: StoreRecord;
  settings: StoreSettingsDraft;
  publishedProducts: StoreProductPreview[];
  settingsPersisted: boolean;
  saving: boolean;
  error: string | null;
  message: string | null;
  setTemplate: (template: DskStoreTemplateId) => void;
  setColor: (key: "primaryColor" | "accentColor", value: string) => void;
  setCountryCode: (countryCode: string) => void;
  save: () => Promise<boolean>;
  publish: (published: boolean) => Promise<boolean>;
};

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

type StoreProviderProps = {
  payload: StoreEditorPayload;
  children: ReactNode;
};

export const StoreProvider = ({ payload, children }: StoreProviderProps) => {
  const [store, setStore] = useState(payload.store);
  const [settings, setSettings] = useState(payload.settings);
  const [publishedProducts] = useState(payload.publishedProducts);
  const [settingsPersisted, setSettingsPersisted] = useState(payload.settingsPersisted);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const setTemplate = useCallback((template: DskStoreTemplateId) => {
    setSettings((current) => ({ ...current, template }));
    setMessage(null);
  }, []);

  const setColor = useCallback((key: "primaryColor" | "accentColor", value: string) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setMessage(null);
  }, []);

  const setCountryCode = useCallback((countryCode: string) => {
    const country = findStoreCountry(countryCode);
    setSettings((current) => ({
      ...current,
      countryCode: country.code,
      dialCode: country.dialCode,
    }));
    setMessage(null);
  }, []);

  const save = useCallback(async () => {
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      const result = await saveStoreCustomization(store.id, settings);
      setStore(result.store);
      setSettings(result.settings);
      setSettingsPersisted(result.settingsPersisted);
      setMessage(
        result.settingsPersisted
          ? "Personnalisation enregistrée."
          : "Pays enregistré. Appliquez la migration store_settings pour persister le thème.",
      );
      return true;
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : "Enregistrement impossible.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [settings, store.id]);

  const publish = useCallback(
    async (published: boolean) => {
      setError(null);
      setMessage(null);
      if (published && publishedProducts.length === 0) {
        setError("Publiez au moins un produit avant d’activer la boutique.");
        return false;
      }

      setSaving(true);
      try {
        const saved = await saveStoreCustomization(store.id, settings);
        setStore(saved.store);
        setSettings(saved.settings);
        setSettingsPersisted(saved.settingsPersisted);

        const updated = await publishStoreEditor(store.id, published ? "active" : "inactive");
        setStore(updated);
        setMessage(published ? "Boutique publiée." : "Boutique désactivée.");
        return true;
      } catch (publishError: unknown) {
        setError(
          publishError instanceof Error ? publishError.message : "Publication impossible.",
        );
        return false;
      } finally {
        setSaving(false);
      }
    },
    [publishedProducts.length, settings, store.id],
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      store,
      settings,
      publishedProducts,
      settingsPersisted,
      saving,
      error,
      message,
      setTemplate,
      setColor,
      setCountryCode,
      save,
      publish,
    }),
    [
      error,
      message,
      publish,
      publishedProducts,
      save,
      saving,
      setColor,
      setCountryCode,
      setTemplate,
      settings,
      settingsPersisted,
      store,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

// The hook shares this module with its provider so they stay paired.
// eslint-disable-next-line react-refresh/only-export-components
export const useEditorStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useEditorStore must be used within StoreProvider");
  return context;
};
