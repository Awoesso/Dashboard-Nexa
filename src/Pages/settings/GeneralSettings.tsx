import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  ImagePlus,
  Loader2,
  Mail,
  RotateCcw,
  UserRound,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { UserAuth } from "@/Context/Authcontext";
import { useProfile } from "@/Context/useProfile";

const inputClass =
  "h-10! w-full! min-w-0! rounded-lg! border! border-gray-200! bg-[#fafafa]! px-3! text-xs! font-medium! text-gray-900! outline-none! transition-all! duration-150! placeholder:text-gray-400! focus:border-blue-500! focus:bg-white! focus:ring-2! focus:ring-blue-500/10! disabled:cursor-not-allowed! disabled:opacity-60!";

const GeneralSettings = () => {
  const { session } = UserAuth();

  const {
    profile,
    isLoading,
    error,
    refreshProfile,
  } = useProfile();

  const avatarInputRef =
    useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] =
    useState("");
  const [lastName, setLastName] =
    useState("");
  const [phone, setPhone] =
    useState("");
  const [avatarUrl, setAvatarUrl] =
    useState("");

  const [isSaving, setIsSaving] =
    useState(false);
  const [isUploading, setIsUploading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);
  const [saveError, setSaveError] =
    useState("");

  /* =========================================================
     PROFILE → FORM
  ========================================================= */

  useEffect(() => {
    if (!profile) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFirstName(profile.first_name || "");
    setLastName(profile.last_name || "");
    setPhone(profile.phone || "");
    setAvatarUrl(profile.avatar_url || "");
  }, [profile]);

  /* =========================================================
     RESET
  ========================================================= */

  const handleReset = () => {
    if (!profile) {
      return;
    }

    setFirstName(profile.first_name || "");
    setLastName(profile.last_name || "");
    setPhone(profile.phone || "");
    setAvatarUrl(profile.avatar_url || "");

    setSuccess(false);
    setSaveError("");
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave = async () => {
    if (!session?.user?.id) {
      setSaveError(
        "Votre session est introuvable.",
      );
      return;
    }

    if (!firstName.trim()) {
      setSaveError(
        "Veuillez renseigner votre prénom.",
      );
      return;
    }

    if (!lastName.trim()) {
      setSaveError(
        "Veuillez renseigner votre nom.",
      );
      return;
    }

    try {
      setIsSaving(true);
      setSuccess(false);
      setSaveError("");

      const { error: updateError } =
        await supabase
          .from("profiles")
          .update({
            first_name:
              firstName.trim(),
            last_name:
              lastName.trim(),
            phone:
              phone.trim() || null,
            avatar_url:
              avatarUrl.trim() || null,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", session.user.id);

      if (updateError) {
        throw updateError;
      }

      await refreshProfile();

      setSuccess(true);

      window.setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Nous ne pouvons pas enregistrer les modifications pour le moment.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* =========================================================
     AVATAR
  ========================================================= */

  const handleAvatarButtonClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSaveError(
        "Veuillez sélectionner une image valide.",
      );

      event.target.value = "";
      return;
    }

    setIsUploading(true);
    setSaveError("");
    setSuccess(false);

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result === "string") {
        setAvatarUrl(result);
      }

      setIsUploading(false);
      event.target.value = "";
    };

    reader.onerror = () => {
      setSaveError(
        "Nous ne pouvons pas lire l’image sélectionnée.",
      );

      setIsUploading(false);
      event.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (isLoading) {
    return (
      <section className="w-full! min-w-0!">
        <div className="mb-6!">
          <div className="skeleton h-3.5! w-36! rounded-md!" />
          <div className="skeleton mt-2! h-2.5! w-60! max-w-full! rounded-md!" />
        </div>

        <div className="divide-y! divide-gray-200! border-y! border-gray-200!">
          <div className="py-5!">
            <div className="flex! items-center! gap-3!">
              <div className="skeleton h-14! w-14! shrink-0! rounded-full!" />

              <div className="flex! min-w-0! flex-1! flex-col! gap-2!">
                <div className="skeleton h-3! w-28! rounded-md!" />
                <div className="skeleton h-2.5! w-44! max-w-full! rounded-md!" />
                <div className="skeleton h-8! w-24! rounded-lg!" />
              </div>
            </div>
          </div>

          <div className="grid! grid-cols-1! gap-3! py-5! sm:grid-cols-[180px_minmax(0,1fr)]! sm:gap-6!">
            <div className="space-y-2!">
              <div className="skeleton h-2.5! w-20! rounded-md!" />
              <div className="skeleton h-2.5! w-36! rounded-md!" />
            </div>

            <div className="grid! grid-cols-1! gap-3! sm:grid-cols-2!">
              <div className="skeleton h-10! w-full! rounded-lg!" />
              <div className="skeleton h-10! w-full! rounded-lg!" />
            </div>
          </div>

          <div className="grid! grid-cols-1! gap-3! py-5! sm:grid-cols-[180px_minmax(0,1fr)]! sm:gap-6!">
            <div className="space-y-2!">
              <div className="skeleton h-2.5! w-24! rounded-md!" />
              <div className="skeleton h-2.5! w-40! rounded-md!" />
            </div>

            <div className="skeleton h-10! w-full! rounded-lg!" />
          </div>

          <div className="grid! grid-cols-1! gap-3! py-5! sm:grid-cols-[180px_minmax(0,1fr)]! sm:gap-6!">
            <div className="space-y-2!">
              <div className="skeleton h-2.5! w-24! rounded-md!" />
              <div className="skeleton h-2.5! w-36! rounded-md!" />
            </div>

            <div className="skeleton h-10! w-full! rounded-lg!" />
          </div>

          <div className="grid! grid-cols-1! gap-3! py-5! sm:grid-cols-[180px_minmax(0,1fr)]! sm:gap-6!">
            <div className="space-y-2!">
              <div className="skeleton h-2.5! w-20! rounded-md!" />
              <div className="skeleton h-2.5! w-40! rounded-md!" />
            </div>

            <div className="skeleton h-10! w-full! rounded-lg!" />
          </div>
        </div>
      </section>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <section className="w-full! min-w-0!">
        <div className="flex! items-start! gap-2.5! border-y! border-red-200! bg-red-50/60! px-3! py-3! text-red-600!">
          <AlertCircle
            size={15}
            className="mt-0.5! shrink-0!"
          />

          <p className="text-[10px]! font-semibold! leading-relaxed! sm:text-[11px]!">
            {error}
          </p>
        </div>
      </section>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className="w-full! min-w-0!">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6!">
        <h2 className="app-section-title text-gray-900!">
          Informations personnelles
        </h2>

        <p className="mt-1! max-w-xl! text-[10px]! leading-5! text-gray-500! sm:text-[11px]!">
          Mettez à jour les informations associées à votre compte.
        </p>
      </div>

      {/* =====================================================
          SETTINGS
      ===================================================== */}

      <div className="divide-y! divide-gray-200! border-y! border-gray-200!">
        {/* ===================================================
            PROFILE PHOTO
        =================================================== */}

        <div className="grid! grid-cols-1! gap-4! py-5! sm:grid-cols-[180px_minmax(0,1fr)]! sm:gap-6!">
          <div className="min-w-0!">
            <p className="text-[11px]! font-semibold! text-gray-900! sm:text-xs!">
              Photo de profil
            </p>

            <p className="mt-1! max-w-[220px]! text-[9px]! leading-4! text-gray-500! sm:text-[10px]!">
              Ajoutez une image à votre profil ou à votre boutique.
            </p>
          </div>

          <div className="min-w-0!">
            <div className="flex! items-center! gap-3!">
              <div className="relative! h-14! w-14! shrink-0! overflow-hidden! rounded-full! border! border-gray-200! bg-[#fafafa]!">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Photo de profil"
                    className="h-full! w-full! object-cover!"
                  />
                ) : (
                  <div className="flex! h-full! w-full! items-center! justify-center! text-gray-400!">
                    <UserRound
                      size={21}
                      strokeWidth={1.8}
                    />
                  </div>
                )}

                {isUploading && (
                  <div className="absolute! inset-0! flex! items-center! justify-center! bg-gray-900/40! text-white!">
                    <Loader2
                      size={15}
                      className="animate-spin!"
                    />
                  </div>
                )}
              </div>

              <div className="min-w-0!">
                <p className="text-[10px]! font-medium! text-gray-700!">
                  JPG, PNG, WEBP ou GIF
                </p>

                <button
                  type="button"
                  onClick={
                    handleAvatarButtonClick
                  }
                  disabled={
                    isUploading ||
                    isSaving
                  }
                  className="
                    mt-1.5!
                    inline-flex!
                    h-8!
                    items-center!
                    gap-1.5!
                    rounded-lg!
                    border!
                    border-gray-200!
                    bg-white!
                    px-3!
                    text-[10px]!
                    font-semibold!
                    text-gray-600!
                    transition-all!
                    duration-150!
                    hover:border-gray-300!
                    hover:bg-gray-50!
                    hover:text-gray-900!
                    active:scale-[0.99]!
                    disabled:cursor-not-allowed!
                    disabled:opacity-50!
                  "
                >
                  <ImagePlus
                    size={12}
                    strokeWidth={1.9}
                  />

                  Modifier la photo
                </button>
              </div>
            </div>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              hidden
              onChange={
                handleAvatarFileChange
              }
            />

            <div className="mt-4!">
              <label
                htmlFor="profile-avatar-url"
                className="mb-1.5! block! text-[10px]! font-semibold! text-gray-700!"
              >
                Adresse de l’image
              </label>

              <input
                id="profile-avatar-url"
                type="url"
                value={avatarUrl}
                onChange={(event) =>
                  setAvatarUrl(
                    event.target.value,
                  )
                }
                placeholder="https://example.com/avatar.png"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* ===================================================
            FULL NAME
        =================================================== */}

        <SettingsRow
          title="Nom complet"
          description="Le nom affiché dans votre tableau de bord."
        >
          <div className="grid! min-w-0! grid-cols-1! gap-3! sm:grid-cols-2!">
            <Field
              label="Prénom"
              htmlFor="profile-first-name"
            >
              <input
                id="profile-first-name"
                type="text"
                value={firstName}
                onChange={(event) =>
                  setFirstName(
                    event.target.value,
                  )
                }
                placeholder="Prénom"
                autoComplete="given-name"
                className={inputClass}
              />
            </Field>

            <Field
              label="Nom"
              htmlFor="profile-last-name"
            >
              <input
                id="profile-last-name"
                type="text"
                value={lastName}
                onChange={(event) =>
                  setLastName(
                    event.target.value,
                  )
                }
                placeholder="Nom"
                autoComplete="family-name"
                className={inputClass}
              />
            </Field>
          </div>
        </SettingsRow>

        {/* ===================================================
            EMAIL
        =================================================== */}

        <SettingsRow
          title="Adresse e-mail"
          description="Utilisée pour vous connecter et recevoir les alertes de votre compte."
        >
          <div className="relative!">
            <Mail
              size={14}
              strokeWidth={1.8}
              className="pointer-events-none! absolute! left-3! top-1/2! -translate-y-1/2! text-gray-400!"
            />

            <input
              id="profile-email"
              type="email"
              disabled
              value={
                session?.user?.email || ""
              }
              className={`${inputClass} cursor-not-allowed! bg-gray-100! pl-9! text-gray-500!`}
            />
          </div>
        </SettingsRow>

        {/* ===================================================
            PHONE
        =================================================== */}

        <SettingsRow
          title="Numéro de téléphone"
          description="Numéro principal associé à votre compte."
        >
          <input
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
            }
            placeholder="+228 90 00 00 00"
            autoComplete="tel"
            className={inputClass}
          />
        </SettingsRow>
      </div>

      {/* =====================================================
          FEEDBACK
      ===================================================== */}

      {success && (
        <div className="mt-4! flex! items-center! gap-2! border-y! border-green-200! bg-green-50/60! px-3! py-3! text-green-700!">
          <Check
            size={14}
            strokeWidth={2.2}
          />

          <p className="text-[10px]! font-semibold! sm:text-[11px]!">
            Modifications enregistrées.
          </p>
        </div>
      )}

      {saveError && (
        <div className="mt-4! flex! items-start! gap-2! border-y! border-red-200! bg-red-50/60! px-3! py-3! text-red-600!">
          <AlertCircle
            size={14}
            strokeWidth={2}
            className="mt-0.5! shrink-0!"
          />

          <p className="text-[10px]! font-semibold! leading-relaxed! sm:text-[11px]!">
            {saveError}
          </p>
        </div>
      )}

      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <div className="mt-5! flex! flex-col-reverse! gap-2.5! border-t! border-gray-200! pt-4! sm:flex-row! sm:justify-end!">
        <button
          type="button"
          onClick={handleReset}
          disabled={isSaving}
          className="
            inline-flex!
            h-10!
            items-center!
            justify-center!
            gap-1.5!
            rounded-lg!
            border!
            border-gray-200!
            bg-white!
            px-4!
            text-[10px]!
            font-semibold!
            text-gray-600!
            transition-all!
            duration-150!
            hover:border-gray-300!
            hover:bg-gray-50!
            hover:text-gray-900!
            active:scale-[0.99]!
            disabled:cursor-not-allowed!
            disabled:opacity-50!
            sm:text-[11px]!
          "
        >
          <RotateCcw
            size={13}
            strokeWidth={1.9}
          />

          Reset
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={
            isSaving || isUploading
          }
          className="
            inline-flex!
            h-10!
            items-center!
            justify-center!
            gap-1.5!
            rounded-lg!
            bg-blue-600!
            px-4!
            text-[10px]!
            font-semibold!
            text-white!
            transition-all!
            duration-150!
            hover:bg-blue-700!
            active:scale-[0.99]!
            disabled:cursor-not-allowed!
            disabled:opacity-60!
            sm:text-[11px]!
          "
        >
          {isSaving ? (
            <>
              <Loader2
                size={13}
                className="animate-spin!"
              />
              Enregistrement en cours…
            </>
          ) : (
            <>
              <Check
                size={13}
                strokeWidth={2.1}
              />
              Enregistrer les modifications
            </>
          )}
        </button>
      </div>
    </section>
  );
};

/* =========================================================
   SETTINGS ROW
========================================================= */

type SettingsRowProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

const SettingsRow = ({
  title,
  description,
  children,
}: SettingsRowProps) => {
  return (
    <div className="grid! grid-cols-1! gap-3! py-5! sm:grid-cols-[180px_minmax(0,1fr)]! sm:gap-6!">
      <div className="min-w-0!">
        <p className="text-[11px]! font-semibold! text-gray-900! sm:text-xs!">
          {title}
        </p>

        <p className="mt-1! max-w-[220px]! text-[9px]! leading-4! text-gray-500! sm:text-[10px]!">
          {description}
        </p>
      </div>

      <div className="min-w-0!">
        {children}
      </div>
    </div>
  );
};

/* =========================================================
   FIELD
========================================================= */

type FieldProps = {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
};

const Field = ({
  label,
  htmlFor,
  children,
}: FieldProps) => {
  return (
    <div className="min-w-0!">
      <label
        htmlFor={htmlFor}
        className="mb-1.5! block! text-[10px]! font-semibold! text-gray-700!"
      >
        {label}
      </label>

      {children}
    </div>
  );
};

export default GeneralSettings;