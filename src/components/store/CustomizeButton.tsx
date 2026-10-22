import { Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CustomizeButtonProps {
  storeSlug: string | null | undefined;
}

export const CustomizeButton = ({ storeSlug }: CustomizeButtonProps) => {
  const navigate = useNavigate();
  const disabled = !storeSlug;

  const handleOpenEditor = () => {
    if (!storeSlug) return;
    navigate(`/editeur/${encodeURIComponent(storeSlug)}`);
  };

  return (
    <button
      type="button"
      onClick={handleOpenEditor}
      disabled={disabled}
      title={disabled ? "Enregistrez d’abord le nom et l’adresse de la boutique." : undefined}
      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Palette size={14} />
      <span>Personnaliser ma boutique</span>
    </button>
  );
};
