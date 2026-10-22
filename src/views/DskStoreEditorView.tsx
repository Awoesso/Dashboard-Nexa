import type { FC } from "react";
import { StoreResolver } from "@/components/routing/StoreResolver";
import { StoreEditorPage } from "@/Pages/StoreEditor/StoreEditorPage";

interface DskStoreEditorViewProps {
  /** Le slug unique de la boutique sélectionnée par le vendeur (ex: "ma-boutique") */
  slug: string;
}

/**
 * Vue principale qui intègre l'atelier DSK-Shop dans Nexa.
 * StoreResolver s'occupe de :
 *  1. Récupérer la boutique et ses réglages (store_settings) depuis Supabase.
 *  2. Injecter le StoreContext et StoreCartContext.
 *  3. Vérifier les autorisations du propriétaire (owner_id).
 */
export const DskStoreEditorView: FC<DskStoreEditorViewProps> = ({ slug }) => {
  return (
    <div className="w-full min-h-screen bg-slate-100">
      <StoreResolver slug={slug}>
        <StoreEditorPage slug={slug} />
      </StoreResolver>
    </div>
  );
};

export default DskStoreEditorView;
