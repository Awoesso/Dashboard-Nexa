import {
  Rocket,
  Settings2,
  Store,
} from "lucide-react";

export type StoreSection =
  | "overview"
  | "information"
  | "publication";

const sections: { id: StoreSection; label: string; icon: typeof Store }[] = [
  { id: "overview", label: "Vue d’ensemble", icon: Store },
  { id: "information", label: "Informations", icon: Settings2 },
  { id: "publication", label: "Publication", icon: Rocket },
];

type StoreSidebarProps = {
  activeSection: StoreSection;
  onSelect: (section: StoreSection) => void;
};

const StoreSidebar = ({ activeSection, onSelect }: StoreSidebarProps) => (
  <nav aria-label="Sections de la boutique" className="flex gap-1 overflow-x-auto border-b! border-gray-200! pb-2 lg:block lg:space-y-1 lg:border-0! lg:pb-0">
    {sections.map(({ id, label, icon: Icon }) => (
      <button
        key={id}
        type="button"
        onClick={() => onSelect(id)}
        aria-current={activeSection === id ? "page" : undefined}
        className={`inline-flex shrink-0 items-center gap-2 rounded-full! px-3 py-2.5 text-[11px]! font-medium! transition-colors! lg:flex lg:w-full ${activeSection === id ? "bg-blue-50! text-blue-700!" : "text-gray-600! hover:bg-gray-100! hover:text-gray-900!"}`}
      >
        <Icon size={15} /> {label}
      </button>
    ))}
  </nav>
);

export default StoreSidebar;