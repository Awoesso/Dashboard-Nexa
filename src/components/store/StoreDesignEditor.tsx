import type { StoreDesign } from "@/types/store";

type StoreDesignEditorProps = {
  design: StoreDesign;
  onChange: (design: StoreDesign) => void;
};

const StoreDesignEditor = ({ design, onChange }: StoreDesignEditorProps) => (
  <section id="store-section-design" className="scroll-mt-5 rounded-2xl! border! border-gray-200! bg-white! p-4 sm:p-5!">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div><h2 className="font-heading! text-[14px]! font-semibold! text-gray-900!">Couleurs</h2><p className="mt-1 text-[11px]! text-gray-500!">Ajustez les couleurs et observez le résultat dans l’aperçu.</p></div>
      <span className="rounded-full! bg-amber-50! px-2 py-1 text-[10px]! font-medium! text-amber-800!">Aperçu seulement</span>
    </div>
    <div className="mt-4 flex flex-wrap gap-4">
      <ColorControl label="Principale" value={design.primaryColor} onChange={(primaryColor) => onChange({ ...design, primaryColor })} />
      <ColorControl label="Accent" value={design.accentColor} onChange={(accentColor) => onChange({ ...design, accentColor })} />
    </div>
    <p className="mt-4 text-[11px]! leading-5! text-gray-500!">Aucune colonne de thème ou de couleurs n’est disponible dans le schéma de boutique versionné. Ces choix disparaîtront en quittant la page.</p>
  </section>
);

const ColorControl = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
  <label className="flex items-center gap-3 rounded-xl! border! border-gray-200! px-3 py-2.5">
    <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-9 cursor-pointer rounded border-0 bg-transparent p-0" />
    <span><span className="block text-[11px]! font-medium! text-gray-800!">{label}</span><span className="font-mono! text-[10px]! uppercase! text-gray-500!">{value}</span></span>
  </label>
);

export default StoreDesignEditor;