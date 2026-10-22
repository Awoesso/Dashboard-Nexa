import { ImagePlus, LockKeyhole } from "lucide-react";

const StoreBrandingForm = () => (
  <section id="store-section-branding" className="scroll-mt-5 rounded-2xl! border! border-gray-200! bg-white! p-4 sm:p-5!">
    <div>
      <h2 className="font-heading! text-[14px]! font-semibold! text-gray-900!">Identité visuelle</h2>
      <p className="mt-1 text-[11px]! text-gray-500!">Logo et bannière de la vitrine.</p>
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {["Logo", "Bannière"].map((label) => (
        <div key={label} className="flex min-h-28 flex-col items-center justify-center rounded-xl! border! border-dashed! border-gray-300! bg-gray-50! p-4 text-center">
          <ImagePlus size={20} className="text-gray-400" />
          <p className="mt-2 text-[11px]! font-medium! text-gray-700!">{label}</p>
          <p className="mt-1 text-[10px]! text-gray-500!">Téléversement indisponible</p>
        </div>
      ))}
    </div>
    <div className="mt-4 flex gap-2 rounded-lg! border! border-amber-200! bg-amber-50! p-3 text-[11px]! leading-5! text-amber-900!">
      <LockKeyhole size={15} className="mt-0.5 shrink-0" />
      <p>La migration disponible ne définit pas de colonnes logo/bannière, de bucket dédié ni de politiques Storage associées. Aucun fichier n’est téléversé tant que ces éléments ne sont pas confirmés.</p>
    </div>
  </section>
);

export default StoreBrandingForm;