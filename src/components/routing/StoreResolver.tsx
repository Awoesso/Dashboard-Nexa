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

type StoreResolverState =
  | { slug: string; status: "loading" }
  | { slug: string; status: "loaded"; payload: StoreEditorPayload }
  | { slug: string; status: "error"; error: string; denied: boolean };

export const StoreResolver = ({ slug, children }: StoreResolverProps) => {
  const [state, setState] = useState<StoreResolverState>({
    slug,
    status: "loading",
  });

  useEffect(() => {
    let active = true;

    void loadStoreEditor(slug)
      .then((payload) => {
        if (!active) return;
        setState({ slug, status: "loaded", payload });
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        const denied =
          loadError instanceof StoreEditorAccessError ||
          loadError instanceof StoreEditorNotFoundError;
        setState({
          slug,
          status: "error",
          denied,
          error:
            loadError instanceof Error
              ? loadError.message
              : "Impossible de charger l’éditeur de boutique.",
        });
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (state.slug !== slug || state.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-slate-900" />
          <p className="mt-3 text-xs text-slate-500">Chargement de l’atelier…</p>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-sm font-semibold text-slate-900">
            {state.denied ? "Accès refusé" : "Éditeur indisponible"}
          </h1>
          <p className="mt-2 text-xs leading-5 text-slate-500">{state.error}</p>
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
    <StoreProvider payload={state.payload}>
      <StoreCartProvider>{children}</StoreCartProvider>
    </StoreProvider>
  );
};
