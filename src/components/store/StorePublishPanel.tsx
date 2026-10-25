import { Check, Circle, Globe2 } from "lucide-react";
import type { StoreRecord } from "@/types/store";

type StorePublishPanelProps = {
  store: StoreRecord | null;
  name: string;
  slug: string;
  publishedCount: number;
  saving: boolean;
  error: string | null;
  message: string | null;
  onToggle: (publish: boolean) => void;
};

const StorePublishPanel = ({ store, name, slug, publishedCount, saving, error, message, onToggle }: StorePublishPanelProps) => {
  const checks = [
    { label: "Nom renseigné", complete: Boolean(name.trim()) },
    { label: "Adresse renseignée", complete: Boolean(slug.trim()) },
    { label: "Au moins un produit publié", complete: publishedCount > 0 },
  ];
  const active = store?.status === "active";

  return (
    <section id="store-section-publication" className="scroll-mt-5 p-4 sm:p-5!">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Globe2 size={17} /></div>
        <div><h2 className="font-heading! text-[14px]! font-semibold! text-gray-900!">Publication</h2><p className="mt-1 text-[11px]! leading-5! text-gray-500!">Vous pouvez préparer votre boutique et son catalogue. La mise en ligne publique n’est pas encore disponible.</p></div>
      </div>
      <ul className="mt-4 space-y-2 border-y! border-gray-100! py-4">
        {checks.map(({ label, complete }) => (
          <li key={label} className="flex items-center gap-2 text-[11px]! text-gray-700!">
            {complete ? <Check size={14} className="text-emerald-600" /> : <Circle size={14} className="text-gray-300" />}
            {label}
          </li>
        ))}
      </ul>
      {(error || message) && <p role={error ? "alert" : "status"} className={`mt-3 text-[11px]! ${error ? "text-red-700!" : "text-emerald-700!"}`}>{error || message}</p>}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-[11px]! text-gray-500!">Statut : {active ? "Activée" : "Désactivée"}</span>
        <button
          type="button"
          disabled={saving || (!active && (!store || checks.some((check) => !check.complete)))}
          onClick={() => onToggle(!active)}
          className={`h-9 rounded-full! border! px-3 text-[11px]! font-semibold! disabled:cursor-not-allowed! disabled:opacity-50! ${active ? "border-gray-200! bg-white! text-gray-900! hover:bg-gray-50!" : "border-blue-600! bg-blue-600! text-white! hover:bg-blue-700!"}`}
        >
          {saving ? "Mise à jour..." : active ? "Désactiver la boutique" : "Activer la boutique"}
        </button>
      </div>
    </section>
  );
};

export default StorePublishPanel;