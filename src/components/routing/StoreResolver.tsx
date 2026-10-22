import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { StoreCartProvider } from "@/Context/StoreCartContext";
import { StoreProvider } from "@/Context/StoreContext";
import {
  loadStoreEditor,
  StoreEditorAccessError,
  StoreEditorNotFoundError,
  type StoreEditorPayload,
} from "@/services/storeEditor.service";

type StoreResolverProps = {
  slug: string;
  children: ReactNode;
};

export const StoreResolver = ({ slug, children }: StoreResolverProps) => {
  const [payload, setPayload] = useState<StoreEditorPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setDenied(false);
    setPayload(null);

    void loadStoreEditor(slug)
      .then((result) => {
        if (!active) return;
        setPayload(result);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        if (
          loadError instanceof StoreEditorAccessError ||
          loadError instanceof StoreEditorNotFoundError
        ) {
          setDenied(true);
          setError(loadError.message);
          return;
        }
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger l’éditeur de boutique.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-slate-900" />
          <p className="mt-3 text-xs text-slate-500">Chargement de l’atelier…</p>
        </div>
      </div>
    );
  }

  if (error || !payload) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-sm font-semibold text-slate-900">
            {denied ? "Accès refusé" : "Éditeur indisponible"}
          </h1>
          <p className="mt-2 text-xs leading-5 text-slate-500">{error}</p>
          <Link
            to="/dashboard/store"
            className="mt-5 inline-flex h-9 items-center rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Retour à Ma boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <StoreProvider payload={payload}>
      <StoreCartProvider>{children}</StoreCartProvider>
    </StoreProvider>
  );
};
