import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Globe2,
  Monitor,
  Palette,
  ShoppingBag,
  Smartphone,
  Tablet,
} from "lucide-react";
import { useStoreCart } from "@/Context/StoreCartContext";
import { useEditorStore } from "@/Context/StoreContext";
import { STORE_COUNTRIES, findStoreCountry } from "@/data/storeCountries";
import type { DskStoreTemplateId, StorePreviewDevice } from "@/types/store";

const TEMPLATES: { id: DskStoreTemplateId; name: string; description: string; frame: string }[] = [
  { id: "fashion", name: "Fashion", description: "Éditorial, luxe et lookbook", frame: "bg-rose-50" },
  { id: "tech", name: "Tech", description: "Contraste fort et catalogue produit", frame: "bg-slate-900" },
  { id: "general", name: "General", description: "Vitrine claire et polyvalente", frame: "bg-amber-50" },
];

const DEVICE_WIDTH: Record<StorePreviewDevice, string> = {
  mobile: "max-w-[390px]",
  tablet: "max-w-[768px]",
  desktop: "max-w-[1100px]",
};

type StoreEditorPageProps = {
  slug: string;
};

export const StoreEditorPage = ({ slug }: StoreEditorPageProps) => {
  const {
    store,
    settings,
    settingsPersisted,
    saving,
    error,
    message,
    setTemplate,
    setColor,
    setCountryCode,
    save,
    publish,
  } = useEditorStore();
  const [tab, setTab] = useState<"modeles" | "identite">("modeles");
  const [device, setDevice] = useState<StorePreviewDevice>("desktop");
  const country = findStoreCountry(settings.countryCode);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/dashboard/store"
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              <ArrowLeft size={14} />
              Nexa
            </Link>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{store.name}</p>
              <p className="truncate text-[11px] text-slate-500">/editeur/{slug}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void publish(store.status !== "active")}
              className="inline-flex h-9 items-center rounded-xl bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {store.status === "active" ? "Dépublier" : "Publier la boutique"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-5 px-4 py-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-2">
            <div className="grid grid-cols-2 gap-1">
              <TabButton active={tab === "modeles"} onClick={() => setTab("modeles")} icon={Palette} label="Modèles" />
              <TabButton active={tab === "identite"} onClick={() => setTab("identite")} icon={Globe2} label="Identité" />
            </div>
          </div>

          {tab === "modeles" ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-slate-900">Modèles</h2>
              <p className="mt-1 text-[11px] text-slate-500">Fashion, Tech ou General — aperçu immédiat.</p>
              <div className="mt-4 space-y-3">
                {TEMPLATES.map((template) => {
                  const selected = settings.template === template.id;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setTemplate(template.id)}
                      className={`w-full overflow-hidden rounded-xl border text-left ${selected ? "border-slate-900 ring-1 ring-slate-900" : "border-slate-200 hover:border-slate-400"}`}
                    >
                      <div className={`h-16 ${template.frame}`} />
                      <div className="flex items-center justify-between gap-2 p-3">
                        <span>
                          <span className="block text-xs font-semibold text-slate-900">{template.name}</span>
                          <span className="mt-0.5 block text-[11px] text-slate-500">{template.description}</span>
                        </span>
                        {selected && <Check size={16} className="shrink-0 text-slate-900" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Identité</h2>
                <p className="mt-1 text-[11px] text-slate-500">Pays, indicatif et couleurs de la vitrine.</p>
              </div>
              <label className="block text-[11px] font-medium text-slate-700">
                Pays et indicatif
                <select
                  value={settings.countryCode}
                  onChange={(event) => setCountryCode(event.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-xs text-slate-900 outline-none focus:border-slate-900"
                >
                  {STORE_COUNTRIES.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.name} {option.dialCode}
                    </option>
                  ))}
                </select>
              </label>
              <p className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
                Indicatif {country.dialCode} · {country.currency} · {country.timezone}
              </p>
              <div className="flex flex-wrap gap-3">
                <ColorField
                  label="Principale"
                  value={settings.primaryColor}
                  onChange={(value) => setColor("primaryColor", value)}
                />
                <ColorField
                  label="Accent"
                  value={settings.accentColor}
                  onChange={(value) => setColor("accentColor", value)}
                />
              </div>
            </section>
          )}

          {(error || message) && (
            <p role={error ? "alert" : "status"} className={`text-[11px] ${error ? "text-red-700" : "text-emerald-700"}`}>
              {error || message}
            </p>
          )}
          {!settingsPersisted && (
            <p className="text-[11px] leading-5 text-amber-800">
              Le thème est prévisualisé. Appliquez la migration `store_settings` pour le sauvegarder.
            </p>
          )}
        </aside>

        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900">Prévisualisation en direct</h2>
            <div className="inline-flex rounded-full border border-slate-200 p-1" role="group" aria-label="Format">
              <DeviceButton label="Mobile" active={device === "mobile"} onClick={() => setDevice("mobile")} icon={Smartphone} />
              <DeviceButton label="Tablette" active={device === "tablet"} onClick={() => setDevice("tablet")} icon={Tablet} />
              <DeviceButton label="Desktop" active={device === "desktop"} onClick={() => setDevice("desktop")} icon={Monitor} />
            </div>
          </div>
          <div className="mt-4 overflow-x-auto rounded-xl bg-slate-100 p-4">
            <LivePreview device={device} />
          </div>
        </section>
      </div>
    </div>
  );
};

const TabButton = ({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Palette;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex h-9 items-center justify-center gap-2 rounded-xl text-xs font-semibold ${active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
  >
    <Icon size={14} />
    {label}
  </button>
);

const DeviceButton = ({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Monitor;
  label: string;
}) => (
  <button
    type="button"
    aria-pressed={active}
    aria-label={label}
    onClick={onClick}
    className={`flex h-8 w-9 items-center justify-center rounded-full ${active ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}
  >
    <Icon size={15} />
  </button>
);

const ColorField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
    <input
      type="color"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-8 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
    />
    <span>
      <span className="block text-[11px] font-medium text-slate-800">{label}</span>
      <span className="font-mono text-[10px] uppercase text-slate-500">{value}</span>
    </span>
  </label>
);

const LivePreview = ({ device }: { device: StorePreviewDevice }) => {
  const { store, settings, publishedProducts } = useEditorStore();
  const { items, addItem } = useStoreCart();
  const country = findStoreCountry(settings.countryCode);
  const isTech = settings.template === "tech";
  const isFashion = settings.template === "fashion";

  return (
    <div
      className={`mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-[max-width] ${DEVICE_WIDTH[device]}`}
    >
      <div
        className={`px-5 py-8 ${isTech ? "text-white" : ""} ${isFashion ? "bg-rose-50" : isTech ? "" : "bg-amber-50"}`}
        style={{ backgroundColor: isTech ? settings.primaryColor : undefined }}
      >
        <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${isTech ? "text-white/70" : "text-slate-500"}`}>
          {country.name} · {country.dialCode}
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight" style={{ color: isTech ? "#fff" : settings.primaryColor }}>
          {store.name}
        </h3>
        <div className="mt-3 h-1 w-12 rounded-full" style={{ backgroundColor: settings.accentColor }} />
        <p className={`mt-3 text-[11px] ${isTech ? "text-white/70" : "text-slate-500"}`}>
          {store.slug} · {items.length} article{items.length === 1 ? "" : "s"} au panier
        </p>
      </div>
      <div className={`grid gap-3 p-4 ${device === "mobile" ? "grid-cols-1" : "grid-cols-2"} ${device === "desktop" ? "lg:grid-cols-3" : ""}`}>
        {publishedProducts.length ? (
          publishedProducts.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-xl border border-slate-200">
              <div className="flex h-24 items-center justify-center bg-slate-100 text-slate-400">
                <ShoppingBag size={20} />
              </div>
              <div className="p-3">
                <h4 className="truncate text-[11px] font-semibold text-slate-900">{product.name}</h4>
                <p className="mt-2 text-[11px] font-semibold" style={{ color: settings.primaryColor }}>
                  {new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(product.price)} {product.currency}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    addItem({
                      productId: product.id,
                      name: product.name,
                      price: product.price,
                      currency: product.currency,
                    })
                  }
                  className="mt-2 text-[10px] font-semibold text-slate-700 hover:text-slate-900"
                >
                  Ajouter
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-[11px] text-slate-500">
            Aucun produit publié pour la prévisualisation.
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreEditorPage;
