import { Check } from "lucide-react";
import type { StoreTemplateId } from "@/types/store";

const templates: { id: StoreTemplateId; name: string; description: string; frame: string; accent: string }[] = [
  { id: "atelier", name: "Atelier", description: "Éditorial et épuré", frame: "bg-stone-100", accent: "bg-emerald-700" },
  { id: "market", name: "Marché", description: "Vivant et coloré", frame: "bg-amber-50", accent: "bg-orange-600" },
  { id: "studio", name: "Studio", description: "Graphique et minimal", frame: "bg-slate-100", accent: "bg-sky-700" },
];

type TemplateGalleryProps = {
  selected: StoreTemplateId;
  onSelect: (template: StoreTemplateId) => void;
};

const TemplateGallery = ({ selected, onSelect }: TemplateGalleryProps) => (
  <section id="store-section-templates" className="scroll-mt-5 rounded-2xl! border! border-gray-200! bg-white! p-4 sm:p-5!">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div><h2 className="font-heading! text-[14px]! font-semibold! text-gray-900!">Modèles</h2><p className="mt-1 text-[11px]! text-gray-500!">Choix appliqué uniquement à l’aperçu de cette session.</p></div>
      <span className="rounded-full! bg-amber-50! px-2 py-1 text-[10px]! font-medium! text-amber-800!">Non sauvegardé</span>
    </div>
    <div className="mt-4 grid gap-3 sm:grid-cols-3">
      {templates.map((template) => {
        const isSelected = selected === template.id;
        return (
          <button key={template.id} type="button" aria-pressed={isSelected} onClick={() => onSelect(template.id)} className={`overflow-hidden rounded-xl! border! text-left transition-colors! ${isSelected ? "border-blue-600! ring-1 ring-blue-600!" : "border-gray-200! hover:border-gray-400!"}`}>
            <div className={`h-28 p-3 ${template.frame}`}>
              <div className="h-3 w-2/5 rounded-sm bg-white/90" />
              <div className="mt-2 grid h-16 grid-cols-3 gap-1.5">
                {[0, 1, 2].map((item) => <div key={item} className="rounded-sm bg-white/80 p-1"><div className={`h-7 rounded-sm ${template.accent} opacity-75`} /><div className="mt-1 h-1 w-3/4 bg-gray-400/50" /></div>)}
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 p-3">
              <span><span className="block text-[11px]! font-semibold! text-gray-900!">{template.name}</span><span className="mt-0.5 block text-[10px]! text-gray-500!">{template.description}</span></span>
              {isSelected && <Check size={16} className="shrink-0 text-blue-600" />}
            </div>
          </button>
        );
      })}
    </div>
  </section>
);

export default TemplateGallery;