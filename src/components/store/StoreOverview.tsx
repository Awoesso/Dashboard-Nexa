import { Package, Store } from "lucide-react";
import { CustomizeButton } from "@/components/store/CustomizeButton";
import type { StoreRecord } from "@/types/store";

type StoreOverviewProps = {
  store: StoreRecord | null;
  productCount: number;
  publishedCount: number;
  onPublish: () => void;
};

const StoreOverview = ({
  store,
  productCount,
  publishedCount,
  onPublish,
}: StoreOverviewProps) => (
  <section id="store-section-overview" className="scroll-mt-5 space-y-4">
    <div className="grid gap-3 sm:grid-cols-3">
      <Metric icon={Store} label="Statut" value={store ? (store.status === "active" ? "Activée" : "Désactivée") : "À configurer"} detail={store?.status === "active" ? "La boutique est activée" : "La boutique n’est pas visible en ligne"} />
      <Metric icon={Package} label="Produits" value={String(productCount)} detail={`${publishedCount} publié${publishedCount === 1 ? "" : "s"}`} />
      <Metric icon={Store} label="Adresse de la boutique" value={store?.slug ? store.slug : "À définir"} detail="Adresse utilisée pour personnaliser votre boutique" />
    </div>

    {!store && (
      <div className="rounded-xl! border! border-amber-200! bg-amber-50! px-4 py-3 text-[11px]! leading-5! text-amber-900!" role="status">
        Aucune boutique n’est encore associée à votre compte. Renseignez son nom et son adresse dans Informations pour la créer.
      </div>
    )}

    <div className="flex flex-col gap-4 rounded-2xl! border! border-gray-200! bg-white! p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5!">
      <div>
        <h2 className="app-section-title text-gray-900!">Votre espace vendeur</h2>
        <p className="mt-1 max-w-xl text-[11px]! leading-5! text-gray-500!">
          Gérez votre vitrine et ses options de présentation dans l’atelier DSK connecté à votre boutique.
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <CustomizeButton storeSlug={store?.slug} />
        <button type="button" onClick={onPublish} className="inline-flex h-9 items-center gap-2 rounded-full! bg-blue-600! px-3 text-[11px]! font-semibold! text-white! hover:bg-blue-700!">
          Gérer la publication
        </button>
      </div>
    </div>
  </section>
);

const Metric = ({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Store;
  label: string;
  value: string;
  detail: string;
}) => (
  <div className="min-w-0 rounded-2xl! border! border-gray-200! bg-white! p-4">
    <div className="flex items-center justify-between text-gray-500">
      <span className="text-[10px]! font-medium!">{label}</span>
      <Icon size={15} />
    </div>
    <p className="mt-3 break-words text-[20px]! font-semibold! tracking-tight! text-gray-900!">{value}</p>
    <p className="mt-1 text-[10px]! text-gray-500!">{detail}</p>
  </div>
);

export default StoreOverview;