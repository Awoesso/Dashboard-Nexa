import { ExternalLink, Save, Store } from "lucide-react";
import { CustomizeButton } from "@/components/store/CustomizeButton";
import type { StoreStatus } from "@/types/store";

type StoreHeaderProps = {
  name: string;
  slug?: string | null;
  status: StoreStatus | null;
  saving: boolean;
  onSave: () => void;
  onPublish: () => void;
};

const StoreHeader = ({
  name,
  slug,
  status,
  saving,
  onSave,
  onPublish,
}: StoreHeaderProps) => (
  <header className="flex flex-col gap-4 border-b! border-gray-200! pb-5 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        <Store size={19} />
      </div>
      <div className="min-w-0">
        <h1 className="app-page-title truncate! text-gray-800!">Ma boutique</h1>
        <p className="app-page-description mt-0.5 text-gray-500!">{name || "Configurez votre espace vendeur"}</p>
      </div>
      {status && (
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px]! font-medium! ${status === "active" ? "bg-emerald-50! text-emerald-700!" : "bg-gray-100! text-gray-600!"}`}>
          {status === "active" ? "Activée" : "Désactivée"}
        </span>
      )}
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <CustomizeButton storeSlug={slug} />
      <button type="button" onClick={onPublish} disabled={saving} className="inline-flex h-9 items-center gap-2 rounded-full! bg-blue-600! px-3 text-[11px]! font-semibold! text-white! hover:bg-blue-700! disabled:opacity-50!">
        <ExternalLink size={14} /> {status === "active" ? "Gérer la publication" : "Publier la boutique"}
      </button>
      <button type="button" onClick={onSave} disabled={saving} className="inline-flex h-9 items-center gap-2 rounded-full! border! border-gray-200! bg-white! px-3 text-[11px]! font-semibold! text-gray-900! hover:bg-gray-50! disabled:opacity-50!">
        <Save size={14} /> {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </div>
  </header>
);

export default StoreHeader;