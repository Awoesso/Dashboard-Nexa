import { Monitor, Package, Smartphone } from "lucide-react";
import { useState } from "react";
import type { StoreDesign, StoreProductPreview, StoreRecord, StoreTemplateId } from "@/types/store";

type StorePreviewProps = {
  store: StoreRecord | null;
  products: StoreProductPreview[];
  template: StoreTemplateId;
  design: StoreDesign;
};

const templateSurfaces: Record<StoreTemplateId, string> = {
  atelier: "bg-stone-50",
  market: "bg-amber-50",
  studio: "bg-slate-50",
};

const StorePreview = ({ store, products, template, design }: StorePreviewProps) => {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  return (
    <section id="store-section-preview" className="scroll-mt-5 rounded-2xl! border! border-gray-200! bg-white! p-4 sm:p-5!">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="font-heading! text-[14px]! font-semibold! text-gray-900!">Aperçu de la vitrine</h2><p className="mt-1 text-[11px]! text-gray-500!">Produits publiés de cette boutique uniquement.</p></div>
        <div className="inline-flex rounded-full! border! border-gray-200! p-1" role="group" aria-label="Format de l’aperçu">
          <button type="button" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")} className={`flex h-8 w-9 items-center justify-center rounded-full! ${device === "desktop" ? "bg-gray-900! text-white!" : "text-gray-500! hover:bg-gray-100!"}`} aria-label="Aperçu ordinateur"><Monitor size={15} /></button>
          <button type="button" aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")} className={`flex h-8 w-9 items-center justify-center rounded-full! ${device === "mobile" ? "bg-gray-900! text-white!" : "text-gray-500! hover:bg-gray-100!"}`} aria-label="Aperçu mobile"><Smartphone size={15} /></button>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl! bg-gray-100! p-3 sm:p-5!">
        <div className={`mx-auto min-h-80 overflow-hidden rounded-xl! border! border-gray-200! shadow-sm transition-[max-width] ${device === "mobile" ? "max-w-[390px]" : "max-w-5xl"}`}>
          <div className={`${templateSurfaces[template]} px-4 py-7 text-center sm:px-8`}>
            <p className="text-[10px]! font-semibold! uppercase! tracking-[0.12em]! text-gray-500!">{store?.country || "Boutique"}</p>
            <h3 className="mt-2 break-words font-heading! text-lg! font-semibold! tracking-tight! text-gray-900!" style={{ color: design.primaryColor }}>{store?.name || "Nom de votre boutique"}</h3>
            <div className="mx-auto mt-3 h-1 w-12 rounded-full" style={{ backgroundColor: design.accentColor }} />
            <p className="mt-3 text-[11px]! text-gray-500!">{store?.slug ? `orion.store/${store.slug}` : "Votre adresse apparaîtra ici"}</p>
          </div>
          <div className={`grid gap-3 bg-white p-4 sm:p-5 ${device === "mobile" ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
            {products.length ? products.map((product) => (
              <article key={product.id} className="overflow-hidden rounded-xl! border! border-gray-200!">
                <div className="flex h-28 items-center justify-center bg-gray-100 text-gray-400"><Package size={22} /></div>
                <div className="p-3">
                  <h4 className="truncate text-[11px]! font-semibold! text-gray-900!">{product.name}</h4>
                  {product.description && <p className="mt-1 line-clamp-2 text-[10px]! leading-4! text-gray-500!">{product.description}</p>}
                  <p className="mt-2 text-[11px]! font-semibold!" style={{ color: design.primaryColor }}>{new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(product.price)} {product.currency}</p>
                </div>
              </article>
            )) : (
              <div className="col-span-full flex min-h-32 flex-col items-center justify-center text-center">
                <Package size={20} className="text-gray-400" />
                <p className="mt-2 text-[11px]! font-medium! text-gray-700!">Aucun produit publié</p>
                <p className="mt-1 text-[10px]! text-gray-500!">Les brouillons et produits d’autres boutiques ne sont pas affichés.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorePreview;