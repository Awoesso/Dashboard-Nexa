import { Save } from "lucide-react";
import type { StoreFieldErrors, StoreFormValues } from "@/types/store";

type StoreInformationFormProps = {
  values: StoreFormValues;
  errors: StoreFieldErrors;
  saving: boolean;
  message: string | null;
  onChange: <Key extends keyof StoreFormValues>(key: Key, value: StoreFormValues[Key]) => void;
  onSave: () => void;
};

const StoreInformationForm = ({ values, errors, saving, message, onChange, onSave }: StoreInformationFormProps) => (
  <section id="store-section-information" className="scroll-mt-5 rounded-2xl! border! border-gray-200! bg-white! p-4 sm:p-5!">
    <div className="mb-5">
      <h2 className="app-section-title text-gray-900!">Informations de la boutique</h2>
      <p className="mt-1 text-[11px]! text-gray-500!">Ces informations seront utilisées pour présenter votre boutique.</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Nom de la boutique" error={errors.name}>
        <input value={values.name} maxLength={80} onChange={(event) => onChange("name", event.target.value)} className={inputClass(Boolean(errors.name))} />
      </Field>
      <Field label="Adresse (slug)" error={errors.slug}>
        <div className={`flex overflow-hidden rounded-lg! border! ${errors.slug ? "border-red-400!" : "border-gray-300!"}`}>
          <span className="flex shrink-0 items-center border-r! border-gray-200! bg-gray-50! px-2.5 text-[10px]! text-gray-500!">orion.store/</span>
          <input value={values.slug} maxLength={60} onChange={(event) => onChange("slug", event.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))} className="min-w-0 flex-1 px-3 py-2 text-[11px]! text-gray-900! outline-none!" />
        </div>
      </Field>
      <Field label="Pays" error={errors.country}>
        <select value={values.country} onChange={(event) => onChange("country", event.target.value)} className={inputClass(Boolean(errors.country))}>
          <option value="Togo">Togo</option><option value="Benin">Bénin</option><option value="Ghana">Ghana</option><option value="Nigeria">Nigeria</option><option value="Ivory Coast">Côte d’Ivoire</option>
        </select>
      </Field>
      <Field label="Devise">
        <select value={values.currency} onChange={(event) => onChange("currency", event.target.value)} className={inputClass(false)}>
          <option value="XOF">XOF — CFA</option><option value="GHS">GHS — Cedi</option><option value="NGN">NGN — Naira</option><option value="USD">USD — Dollar</option><option value="EUR">EUR — Euro</option>
        </select>
      </Field>
      <Field label="Langue">
        <select value={values.language} onChange={(event) => onChange("language", event.target.value)} className={inputClass(false)}>
          <option value="French">Français</option><option value="English">Anglais</option>
        </select>
      </Field>
      <Field label="Fuseau horaire">
        <select value={values.timezone} onChange={(event) => onChange("timezone", event.target.value)} className={inputClass(false)}>
          <option value="Africa/Lome">Africa/Lomé</option><option value="Europe/Paris">Europe/Paris</option><option value="America/New_York">America/New York</option>
        </select>
      </Field>
    </div>
    <p className="mt-4 rounded-lg! bg-gray-50! px-3 py-2 text-[11px]! leading-5! text-gray-600!">
      La description de la boutique n’est pas encore disponible.
    </p>
    <div className="mt-4 flex min-h-9 items-center justify-between gap-3">
      <p className="text-[11px]! text-emerald-700!" role="status">{message}</p>
      <button type="button" onClick={onSave} disabled={saving} className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full! bg-blue-600! px-3 text-[11px]! font-semibold! text-white! hover:bg-blue-700! disabled:opacity-50!">
        <Save size={14} /> {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </div>
  </section>
);

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <label className="block min-w-0 text-[11px]! font-medium! text-gray-700!">
    <span>{label}</span>
    <div className="mt-1.5">{children}</div>
    {error && <span className="mt-1 block text-[10px]! font-normal! text-red-600!">{error}</span>}
  </label>
);

const inputClass = (invalid: boolean) => `h-9 w-full rounded-lg! border! px-3 text-[11px]! text-gray-900! outline-none! focus:border-blue-500! ${invalid ? "border-red-400!" : "border-gray-300!"}`;

export default StoreInformationForm;