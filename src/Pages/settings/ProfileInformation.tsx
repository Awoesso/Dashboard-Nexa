import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  Bell,
  Check,
  ChevronRight,
  Globe,
  ImagePlus,
  Loader2,
  LogOut,
  Mail,
  Package,
  RotateCcw,
  Shield,
  Store,
  User,
  UserRound,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { UserAuth } from "@/Context/Authcontext";
import { useProfile } from "@/Context/useProfile";

/* =========================================================
   TYPES
========================================================= */

type SettingsTab =
  | "general"
  | "store"
  | "notifications"
  | "security";

type NotificationPreferences = {
  orders: boolean;
};

/* =========================================================
   CONSTANTS
========================================================= */

const STORAGE_KEY =
  "orion-settings-notifications";

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  orders: true,
};

const inputClass =
  "h-10! w-full! min-w-0! rounded-xl! border! border-gray-200! bg-[#fafafa]! px-3.5! text-xs! font-medium! text-gray-900! outline-none! transition-all! duration-150! placeholder:text-gray-400! focus:border-blue-600! focus:bg-white! focus:ring-2! focus:ring-blue-600/10! disabled:cursor-not-allowed! disabled:opacity-60!";

/* =========================================================
   MAIN COMPONENT
========================================================= */

const ProfileStoreSettings = () => {
  const { session, signOut } = UserAuth();

  const {
    profile,
    isLoading,
    error,
    refreshProfile,
  } = useProfile();

  /* =======================================================
     TAB
  ======================================================= */

  const [activeTab, setActiveTab] =
    useState<SettingsTab>("general");

  /* =======================================================
     FORM
  ======================================================= */

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [storeName, setStoreName] =
    useState("");

  const [avatarUrl, setAvatarUrl] =
    useState("");

  const [bio, setBio] =
    useState("");

  const [timezone, setTimezone] =
    useState("GMT+00:00 - UTC");

  const [notifications, setNotifications] =
    useState<NotificationPreferences>(() => {
      const saved =
        localStorage.getItem(
          STORAGE_KEY,
        );

      if (!saved) {
        return DEFAULT_NOTIFICATIONS;
      }

      try {
        const parsed = JSON.parse(saved);

        return {
          ...DEFAULT_NOTIFICATIONS,
          ...parsed,
        };
      } catch {
        return DEFAULT_NOTIFICATIONS;
      }
    });

  /* =======================================================
     UI STATE
  ======================================================= */

  const [isUploading, setIsUploading] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [saveSuccess, setSaveSuccess] =
    useState(false);

  const [saveError, setSaveError] =
    useState("");

  const [showLogoutModal, setShowLogoutModal] =
    useState(false);

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  /* =======================================================
     PROFILE → FORM
  ======================================================= */

  useEffect(() => {
    if (!profile) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFirstName(profile.first_name || "");
    setLastName(profile.last_name || "");
    setPhone(profile.phone || "");
    setStoreName(profile.store_name || "");
    setAvatarUrl(profile.avatar_url || "");
    setBio(profile.bio || "");
  }, [profile]);

  /* =======================================================
     ESCAPE
  ======================================================= */

  useEffect(() => {
    if (!showLogoutModal) {
      return;
    }

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key === "Escape" &&
        !isLoggingOut
      ) {
        setShowLogoutModal(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [
    showLogoutModal,
    isLoggingOut,
  ]);

  /* =======================================================
     AVATAR UPLOAD
  ======================================================= */

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    if (
      !file ||
      !session?.user?.id
    ) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSaveError(
        "Veuillez sélectionner un fichier image valide.",
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setSaveError(
        "Maximum image size is 5 MB.",
      );

      event.target.value = "";
      return;
    }

    try {
      setIsUploading(true);
      setSaveError("");
      setSaveSuccess(false);

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg";

      const filePath =
        `${session.user.id}/avatar-${Date.now()}.${extension}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("avatars")
        .upload(
          filePath,
          file,
          {
            upsert: true,
            contentType: file.type,
          },
        );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data,
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(
        data.publicUrl,
      );
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Nous ne pouvons pas envoyer l’image pour le moment.",
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  /* =======================================================
     RESET
  ======================================================= */

  const handleReset = () => {
    if (!profile) {
      return;
    }

    setFirstName(
      profile.first_name || "",
    );

    setLastName(
      profile.last_name || "",
    );

    setPhone(
      profile.phone || "",
    );

    setStoreName(
      profile.store_name || "",
    );

    setAvatarUrl(
      profile.avatar_url || "",
    );

    setBio(
      profile.bio || "",
    );

    setSaveSuccess(false);
    setSaveError("");
  };

  /* =======================================================
     SAVE
  ======================================================= */

  const handleSave = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

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

      setActiveTab("general");
      return;
    }

    if (!lastName.trim()) {
      setSaveError(
        "Veuillez renseigner votre nom.",
      );

      setActiveTab("general");
      return;
    }

    try {
      setIsSaving(true);
      setSaveSuccess(false);
      setSaveError("");

      const {
        error: updateError,
      } = await supabase
        .from("profiles")
        .update({
          first_name:
            firstName.trim(),

          last_name:
            lastName.trim(),

          phone:
            phone.trim() || null,

          store_name:
            storeName.trim() || null,

          avatar_url:
            avatarUrl.trim() || null,

          bio:
            bio.trim() || null,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          session.user.id,
        );

      if (updateError) {
        throw updateError;
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          notifications,
        ),
      );

      await refreshProfile();

      setSaveSuccess(true);

      window.setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Nous ne pouvons pas enregistrer les paramètres pour le moment.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  const toggleNotifications = () => {
    setNotifications(
      (current) => ({
        ...current,
        orders:
          !current.orders,
      }),
    );

    setSaveSuccess(false);
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await signOut();

      setShowLogoutModal(false);
    } catch (err) {
      console.error(
        "Logout failed:",
        err,
      );

      setIsLoggingOut(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <SettingsSkeleton />
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <main className="min-h-full! w-full! bg-[#fafafa]! px-3! py-3! sm:px-4! sm:py-5! lg:px-6! lg:py-6!">
        <div className="mx-auto! w-full! max-w-6xl!">
          <div className="flex! items-start! gap-2.5! rounded-xl! border! border-red-200! bg-red-50! p-3! text-red-600!">
            <AlertCircle
              size={15}
              className="mt-0.5! shrink-0!"
            />

            <p className="text-[10px]! font-semibold! leading-relaxed! sm:text-[11px]!">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <>
      <main className="min-h-full! w-full! min-w-0! bg-[#fafafa]! px-3! py-3! sm:px-4! sm:py-5! lg:px-6! lg:py-6!">
        <div className="mx-auto! w-full! max-w-6xl!">
          {/* =================================================
              HEADER
          ================================================= */}

          <header className="mb-5!">
            <div className="flex! min-w-0! items-end! justify-between! gap-4!">
              <div className="min-w-0!">
                <h1 className="font-heading! text-lg! font-semibold! tracking-tight! text-gray-900! sm:text-xl!">
                  Settings
                </h1>

                <p className="mt-1! max-w-xl! text-[10px]! font-medium! leading-relaxed! text-gray-500! sm:text-[11px]!">
                  Manage your account, store, notifications and
                  security preferences.
                </p>
              </div>

              <div className="hidden! shrink-0! items-center! gap-1.5! sm:flex!">
                <span className="h-1.5! w-1.5! rounded-full! bg-green-500!" />

                <span className="text-[9px]! font-semibold! text-gray-500!">
                  Active
                </span>
              </div>
            </div>
          </header>

          {/* =================================================
              TABS
          ================================================= */}

          <div className="mb-5! overflow-x-auto! border-b! border-gray-200!">
            <nav
              className="flex! min-w-max! items-center! gap-5! sm:gap-6!"
              aria-label="Navigation des paramètres"
            >
              <SettingsTab
                active={
                  activeTab === "general"
                }
                icon={
                  <User
                    size={14}
                    strokeWidth={1.8}
                  />
                }
                label="Général"
                onClick={() =>
                  setActiveTab("general")
                }
              />

              <SettingsTab
                active={
                  activeTab === "store"
                }
                icon={
                  <Store
                    size={14}
                    strokeWidth={1.8}
                  />
                }
                label="Boutique"
                onClick={() =>
                  setActiveTab("store")
                }
              />

              <SettingsTab
                active={
                  activeTab ===
                  "notifications"
                }
                icon={
                  <Bell
                    size={14}
                    strokeWidth={1.8}
                  />
                }
                label="Notifications"
                onClick={() =>
                  setActiveTab(
                    "notifications",
                  )
                }
              />

              <SettingsTab
                active={
                  activeTab ===
                  "security"
                }
                icon={
                  <Shield
                    size={14}
                    strokeWidth={1.8}
                  />
                }
                label="Sécurité"
                onClick={() =>
                  setActiveTab("security")
                }
              />
            </nav>
          </div>

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <form
            onSubmit={handleSave}
            className="w-full! min-w-0! rounded-2xl! border! border-gray-200! bg-white! shadow-sm!"
          >
            {activeTab === "general" && (
              <GeneralSection
                firstName={firstName}
                lastName={lastName}
                phone={phone}
                email={
                  session?.user?.email || ""
                }
                avatarUrl={avatarUrl}
                bio={bio}
                isUploading={
                  isUploading
                }
                isSaving={isSaving}
                fileInputRef={
                  fileInputRef
                }
                onFirstNameChange={
                  setFirstName
                }
                onLastNameChange={
                  setLastName
                }
                onPhoneChange={setPhone}
                onAvatarUrlChange={
                  setAvatarUrl
                }
                onBioChange={setBio}
                onAvatarUpload={
                  handleAvatarUpload
                }
                onOpenAvatarPicker={() =>
                  fileInputRef.current?.click()
                }
              />
            )}

            {activeTab === "store" && (
              <StoreSection
                storeName={storeName}
                phone={phone}
                timezone={timezone}
                onStoreNameChange={
                  setStoreName
                }
                onPhoneChange={setPhone}
                onTimezoneChange={
                  setTimezone
                }
              />
            )}

            {activeTab ===
              "notifications" && (
              <NotificationsSection
                enabled={
                  notifications.orders
                }
                onToggle={
                  toggleNotifications
                }
              />
            )}

            {activeTab === "security" && (
              <SecuritySection
                email={
                  session?.user?.email ||
                  ""
                }
                onLogout={() =>
                  setShowLogoutModal(true)
                }
              />
            )}

            {/* =================================================
                FEEDBACK
            ================================================= */}

            {(saveSuccess ||
              saveError) && (
              <div className="border-t! border-gray-200! px-4! py-3.5! sm:px-5!">
                {saveSuccess && (
                  <div className="flex! items-center! gap-2! text-green-600!">
                    <Check
                      size={14}
                      strokeWidth={2.2}
                    />

                    <p className="text-[10px]! font-semibold! sm:text-[11px]!">
                      Paramètres enregistrés.
                    </p>
                  </div>
                )}

                {saveError && (
                  <div className="flex! items-start! gap-2! text-red-500!">
                    <AlertCircle
                      size={14}
                      className="mt-0.5! shrink-0!"
                    />

                    <p className="text-[10px]! font-semibold! leading-relaxed! sm:text-[11px]!">
                      {saveError}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                ACTIONS
            ================================================= */}

            {activeTab !== "security" && (
              <div className="flex! flex-col-reverse! gap-2.5! border-t! border-gray-200! p-4! sm:flex-row! sm:justify-end! sm:p-5!">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={
                    isSaving ||
                    isUploading
                  }
                  className="
                    inline-flex!
                    h-10!
                    w-full!
                    items-center!
                    justify-center!
                    gap-1.5!
                    rounded-xl!
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
                    sm:w-auto!
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
                  type="submit"
                  disabled={
                    isSaving ||
                    isUploading
                  }
                  className="
                    inline-flex!
                    h-10!
                    w-full!
                    items-center!
                    justify-center!
                    gap-1.5!
                    rounded-xl!
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
                    sm:w-auto!
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
            )}
          </form>
        </div>
      </main>

      {/* =====================================================
          LOGOUT MODAL
      ===================================================== */}

      {showLogoutModal && (
        <LogoutModal
          isLoggingOut={
            isLoggingOut
          }
          onClose={() =>
            setShowLogoutModal(false)
          }
          onConfirm={
            handleLogout
          }
        />
      )}
    </>
  );
};

/* ===========================================================
   SETTINGS TAB
=========================================================== */

interface SettingsTabProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const SettingsTab = ({
  active,
  icon,
  label,
  onClick,
}: SettingsTabProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={
        active
          ? "page"
          : undefined
      }
      className={`
        relative!
        inline-flex!
        h-11!
        shrink-0!
        items-center!
        gap-1.5!
        border-b-2!
        text-[10px]!
        font-semibold!
        transition-colors!
        duration-150!
        sm:text-[11px]!
        ${
          active
            ? "border-blue-600! text-blue-600!"
            : "border-transparent! text-gray-500! hover:text-gray-900!"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
};

/* ===========================================================
   GENERAL
=========================================================== */

interface GeneralSectionProps {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  avatarUrl: string;
  bio: string;
  isUploading: boolean;
  isSaving: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFirstNameChange: (
    value: string,
  ) => void;
  onLastNameChange: (
    value: string,
  ) => void;
  onPhoneChange: (
    value: string,
  ) => void;
  onAvatarUrlChange: (
    value: string,
  ) => void;
  onBioChange: (
    value: string,
  ) => void;
  onAvatarUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onOpenAvatarPicker: () => void;
}

const GeneralSection = ({
  firstName,
  lastName,
  phone,
  email,
  avatarUrl,
  bio,
  isUploading,
  isSaving,
  fileInputRef,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  onAvatarUrlChange,
  onBioChange,
  onAvatarUpload,
  onOpenAvatarPicker,
}: GeneralSectionProps) => {
  return (
    <div className="divide-y! divide-gray-200!">
      {/* Header */}

      <div className="p-4! sm:p-5!">
        <h2 className="font-heading! text-[14px]! font-semibold! tracking-tight! text-gray-900! sm:text-[15px]!">
          Informations personnelles
        </h2>

        <p className="mt-0.5! text-[10px]! font-medium! leading-relaxed! text-gray-500! sm:text-[11px]!">
          Gérez les informations associées à votre compte.
        </p>
      </div>

      {/* Profile */}

      <div className="grid! grid-cols-1! gap-4! p-4! sm:grid-cols-[180px_minmax(0,1fr)]! sm:p-5!">
        <SettingLabel
          title="Photo de profil"
          description="Choisissez une image nette pour votre compte."
        />

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
                    size={22}
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                hidden
                onChange={
                  onAvatarUpload
                }
              />

              <button
                type="button"
                onClick={
                  onOpenAvatarPicker
                }
                disabled={
                  isUploading ||
                  isSaving
                }
                className="
                  inline-flex!
                  h-8!
                  items-center!
                  gap-1.5!
                  rounded-xl!
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

              <p className="mt-1.5! text-[9px]! font-medium! text-gray-400!">
                JPG, PNG ou WEBP · 5 Mo maximum
              </p>
            </div>
          </div>

          <div className="mt-3!">
            <label
              htmlFor="settings-avatar-url"
              className="mb-1.5! block! text-[10px]! font-semibold! text-gray-700!"
            >
              Adresse de l’image
            </label>

            <input
              id="settings-avatar-url"
              type="url"
              value={avatarUrl}
              onChange={(event) =>
                onAvatarUrlChange(
                  event.target.value,
                )
              }
              placeholder="https://example.com/avatar.png"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Name */}

      <div className="grid! grid-cols-1! gap-4! p-4! sm:grid-cols-[180px_minmax(0,1fr)]! sm:p-5!">
        <SettingLabel
          title="Nom complet"
          description="Le nom affiché dans votre tableau de bord."
        />

        <div className="grid! min-w-0! grid-cols-1! gap-3! sm:grid-cols-2!">
          <Field
            id="settings-first-name"
            label="Prénom"
            value={firstName}
            placeholder="Prénom"
            onChange={
              onFirstNameChange
            }
          />

          <Field
            id="settings-last-name"
            label="Nom"
            value={lastName}
            placeholder="Nom"
            onChange={
              onLastNameChange
            }
          />
        </div>
      </div>

      {/* Email */}

      <div className="grid! grid-cols-1! gap-4! p-4! sm:grid-cols-[180px_minmax(0,1fr)]! sm:p-5!">
        <SettingLabel
          title="Adresse e-mail"
          description="Utilisée pour vous connecter et recevoir les alertes de votre compte."
        />

        <div className="relative! min-w-0!">
          <Mail
            size={14}
            strokeWidth={1.8}
            className="pointer-events-none! absolute! left-3! top-1/2! -translate-y-1/2! text-gray-400!"
          />

          <input
            type="email"
            value={email}
            disabled
            className={`${inputClass} cursor-not-allowed! bg-gray-100! pl-9! text-gray-500!`}
          />
        </div>
      </div>

      {/* Phone */}

      <div className="grid! grid-cols-1! gap-4! p-4! sm:grid-cols-[180px_minmax(0,1fr)]! sm:p-5!">
        <SettingLabel
          title="Numéro de téléphone"
          description="Numéro principal associé à votre compte."
        />

        <Field
          id="settings-phone"
          label="Téléphone"
          value={phone}
          placeholder="+228 90 00 00 00"
          type="tel"
          onChange={
            onPhoneChange
          }
        />
      </div>

      {/* Bio */}

      <div className="grid! grid-cols-1! gap-4! p-4! sm:grid-cols-[180px_minmax(0,1fr)]! sm:p-5!">
        <SettingLabel
          title="Présentation"
          description="Une courte description de votre profil."
        />

        <textarea
          id="settings-bio"
          rows={4}
          value={bio}
          onChange={(event) =>
            onBioChange(
              event.target.value,
            )
          }
          placeholder="Rédigez une courte présentation…"
          className="
            w-full!
            min-w-0!
            resize-none!
            rounded-xl!
            border!
            border-gray-200!
            bg-[#fafafa]!
            px-3.5!
            py-3!
            text-xs!
            font-medium!
            text-gray-900!
            outline-none!
            transition-all!
            duration-150!
            placeholder:text-gray-400!
            focus:border-blue-600!
            focus:bg-white!
            focus:ring-2!
            focus:ring-blue-600/10!
          "
        />
      </div>
    </div>
  );
};

/* ===========================================================
   STORE
=========================================================== */

interface StoreSectionProps {
  storeName: string;
  phone: string;
  timezone: string;
  onStoreNameChange: (
    value: string,
  ) => void;
  onPhoneChange: (
    value: string,
  ) => void;
  onTimezoneChange: (
    value: string,
  ) => void;
}

const StoreSection = ({
  storeName,
  phone,
  timezone,
  onStoreNameChange,
  onPhoneChange,
  onTimezoneChange,
}: StoreSectionProps) => {
  return (
    <div className="divide-y! divide-gray-200!">
      <div className="p-4! sm:p-5!">
        <h2 className="font-heading! text-[14px]! font-semibold! tracking-tight! text-gray-900! sm:text-[15px]!">
          Informations de la boutique
        </h2>

        <p className="mt-0.5! text-[10px]! font-medium! leading-relaxed! text-gray-500! sm:text-[11px]!">
          Configurez les informations associées à votre boutique.
        </p>
      </div>

      {/* Store name */}

      <div className="grid! grid-cols-1! gap-4! p-4! sm:grid-cols-[180px_minmax(0,1fr)]! sm:p-5!">
        <SettingLabel
          title="Nom de la boutique"
          description="Affiché sur votre boutique et les pages destinées à vos clients."
        />

        <Field
          id="settings-store-name"
          label="Nom de la boutique"
          value={storeName}
          placeholder="Nom de votre boutique"
          onChange={
            onStoreNameChange
          }
        />
      </div>

      {/* Phone */}

      <div className="grid! grid-cols-1! gap-4! p-4! sm:grid-cols-[180px_minmax(0,1fr)]! sm:p-5!">
        <SettingLabel
          title="Téléphone d’assistance"
          description="Main contact number for customer support."
        />

        <Field
          id="settings-support-phone"
          label="Téléphone"
          value={phone}
          placeholder="+228 90 00 00 00"
          type="tel"
          onChange={onPhoneChange}
        />
      </div>

      {/* Timezone */}

      <div className="grid! grid-cols-1! gap-4! p-4! sm:grid-cols-[180px_minmax(0,1fr)]! sm:p-5!">
        <SettingLabel
          title="Fuseau horaire"
          description="Used for local order and activity timestamps."
        />

        <div className="relative! min-w-0!">
          <Globe
            size={14}
            strokeWidth={1.8}
            className="pointer-events-none! absolute! left-3! top-1/2! -translate-y-1/2! text-gray-400!"
          />

          <select
            value={timezone}
            onChange={(event) =>
              onTimezoneChange(
                event.target.value,
              )
            }
            className={`${inputClass} appearance-none! pl-9! pr-9!`}
          >
            <option value="GMT+00:00 - UTC">
              GMT+00:00 - UTC (Lomé)
            </option>

            <option value="GMT+01:00 - CET">
              GMT+01:00 - CET (Paris)
            </option>

            <option value="GMT-05:00 - EST">
              GMT-05:00 - EST (New York)
            </option>
          </select>

          <ChevronRight
            size={13}
            className="pointer-events-none! absolute! right-3! top-1/2! -translate-y-1/2! rotate-90! text-gray-400!"
          />
        </div>
      </div>
    </div>
  );
};

/* ===========================================================
   NOTIFICATIONS
=========================================================== */

interface NotificationsSectionProps {
  enabled: boolean;
  onToggle: () => void;
}

const NotificationsSection = ({
  enabled,
  onToggle,
}: NotificationsSectionProps) => {
  return (
    <div className="divide-y! divide-gray-200!">
      <div className="p-4! sm:p-5!">
        <h2 className="font-heading! text-[14px]! font-semibold! tracking-tight! text-gray-900! sm:text-[15px]!">
          Notifications
        </h2>

        <p className="mt-0.5! text-[10px]! font-medium! leading-relaxed! text-gray-500! sm:text-[11px]!">
          Choose which activities should generate notifications.
        </p>
      </div>

      <div className="flex! min-w-0! items-center! justify-between! gap-4! p-4! sm:p-5!">
        <div className="flex! min-w-0! items-start! gap-3!">
          <Package
            size={16}
            strokeWidth={1.8}
            className={`mt-0.5! shrink-0! ${
              enabled
                ? "text-blue-600!"
                : "text-gray-400!"
            }`}
          />

          <div className="min-w-0!">
            <p className="text-[11px]! font-semibold! text-gray-900! sm:text-xs!">
              Nouvelles commandes
            </p>

            <p className="mt-0.5! max-w-xl! text-[9px]! font-medium! leading-relaxed! text-gray-500! sm:text-[10px]!">
              Recevez une notification à chaque nouvelle commande.
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Activer ou désactiver les notifications de nouvelles commandes"
          onClick={onToggle}
          className={`
            relative!
            h-6!
            w-11!
            shrink-0!
            rounded-full!
            transition-colors!
            duration-200!
            focus:outline-none!
            focus:ring-2!
            focus:ring-blue-600/20!
            ${
              enabled
                ? "bg-blue-600!"
                : "bg-gray-300!"
            }
          `}
        >
          <span
            className={`
              absolute!
              top-1!
              h-4!
              w-4!
              rounded-full!
              bg-white!
              shadow-sm!
              transition-transform!
              duration-200!
              ${
                enabled
                  ? "translate-x-6!"
                  : "translate-x-1!"
              }
            `}
          />
        </button>
      </div>
    </div>
  );
};

/* ===========================================================
   SECURITY
=========================================================== */

interface SecuritySectionProps {
  email: string;
  onLogout: () => void;
}

const SecuritySection = ({
  email,
  onLogout,
}: SecuritySectionProps) => {
  return (
    <div className="divide-y! divide-gray-200!">
      <div className="p-4! sm:p-5!">
        <h2 className="font-heading! text-[14px]! font-semibold! tracking-tight! text-gray-900! sm:text-[15px]!">
          Security
        </h2>

        <p className="mt-0.5! text-[10px]! font-medium! leading-relaxed! text-gray-500! sm:text-[11px]!">
          Manage account access and your current session.
        </p>
      </div>

      {/* Account status */}

      <div className="flex! min-w-0! items-center! justify-between! gap-4! p-4! sm:p-5!">
        <div className="flex! min-w-0! items-start! gap-3!">
          <Check
            size={16}
            strokeWidth={2.2}
            className="mt-0.5! shrink-0! text-green-600!"
          />

          <div className="min-w-0!">
            <p className="text-[11px]! font-semibold! text-gray-900! sm:text-xs!">
              Account status
            </p>

            <p className="mt-0.5! text-[9px]! font-medium! text-gray-500! sm:text-[10px]!">
              Your account is authenticated and active.
            </p>
          </div>
        </div>

        <span className="shrink-0! text-[9px]! font-semibold! text-green-600!">
          Active
        </span>
      </div>

      {/* Current session */}

      <div className="flex! min-w-0! items-center! justify-between! gap-4! p-4! sm:p-5!">
        <div className="flex! min-w-0! items-start! gap-3!">
          <Mail
            size={15}
            strokeWidth={1.8}
            className="mt-0.5! shrink-0! text-gray-400!"
          />

          <div className="min-w-0!">
            <p className="text-[11px]! font-semibold! text-gray-900! sm:text-xs!">
              Session actuelle
            </p>

            <p className="mt-0.5! max-w-lg! break-all! text-[9px]! font-medium! text-gray-500! sm:text-[10px]!">
              {email ||               "Utilisateur authentifié"}
            </p>
          </div>
        </div>

        <span className="shrink-0! text-[9px]! font-semibold! text-gray-400!">
          Actuelle
        </span>
      </div>

      {/* Protection */}

      <div className="p-4! sm:p-5!">
        <div className="flex! items-start! gap-2.5!">
          <Shield
            size={16}
            strokeWidth={1.8}
            className="mt-0.5! shrink-0! text-blue-600!"
          />

          <div className="min-w-0!">
            <p className="text-[11px]! font-semibold! text-gray-900! sm:text-xs!">
              Account protection
            </p>

            <p className="mt-0.5! max-w-xl! text-[9px]! font-medium! leading-relaxed! text-gray-500! sm:text-[10px]!">
              Authentication and sessions are securely managed
              by your authentication provider.
            </p>
          </div>
        </div>
      </div>

      {/* Sign out */}

      <div className="flex! min-w-0! items-center! justify-between! gap-4! p-4! sm:p-5!">
        <div className="flex! min-w-0! items-start! gap-3!">
          <LogOut
            size={15}
            strokeWidth={1.8}
            className="mt-0.5! shrink-0! text-gray-400!"
          />

          <div className="min-w-0!">
            <p className="text-[11px]! font-semibold! text-gray-900! sm:text-xs!">
              Sign out
            </p>

            <p className="mt-0.5! text-[9px]! font-medium! leading-relaxed! text-gray-500! sm:text-[10px]!">
              End the               Session actuelle on this device.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="
            inline-flex!
            h-9!
            shrink-0!
            items-center!
            gap-1.5!
            rounded-xl!
            border!
            border-gray-200!
            bg-white!
            px-3!
            text-[10px]!
            font-semibold!
            text-gray-600!
            transition-all!
            duration-150!
            hover:border-red-200!
            hover:bg-red-50!
            hover:text-red-600!
            active:scale-[0.99]!
            sm:text-[11px]!
          "
        >
          <LogOut
            size={13}
            strokeWidth={1.9}
          />
          Sign out
        </button>
      </div>

      {/* Danger zone */}

      <div className="p-4! sm:p-5!">
        <div className="border-l-2! border-red-200! pl-3!">
          <p className="text-[11px]! font-semibold! text-red-700! sm:text-xs!">
            Danger zone
          </p>

          <p className="mt-0.5! max-w-xl! text-[9px]! font-medium! leading-relaxed! text-gray-500! sm:text-[10px]!">
            Permanent account deletion can be added later with
            server-side protection and a dedicated confirmation flow.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ===========================================================
   SETTING LABEL
=========================================================== */

interface SettingLabelProps {
  title: string;
  description: string;
}

const SettingLabel = ({
  title,
  description,
}: SettingLabelProps) => {
  return (
    <div className="min-w-0!">
      <p className="text-[11px]! font-semibold! text-gray-900! sm:text-xs!">
        {title}
      </p>

      <p className="mt-0.5! max-w-xs! text-[9px]! font-medium! leading-relaxed! text-gray-500! sm:text-[10px]!">
        {description}
      </p>
    </div>
  );
};

/* ===========================================================
   FIELD
=========================================================== */

interface FieldProps {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  onChange: (
    value: string,
  ) => void;
}

const Field = ({
  id,
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: FieldProps) => {
  return (
    <div className="min-w-0!">
      <label
        htmlFor={id}
        className="mb-1.5! block! text-[10px]! font-semibold! text-gray-700!"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className={inputClass}
      />
    </div>
  );
};

/* ===========================================================
   LOGOUT MODAL
=========================================================== */

interface LogoutModalProps {
  isLoggingOut: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal = ({
  isLoggingOut,
  onClose,
  onConfirm,
}: LogoutModalProps) => {
  return (
    <div
      className="
        fixed!
        inset-0!
            z-100!
        flex!
        items-center!
        justify-center!
        bg-gray-950/40!
        p-4!
        backdrop-blur-md!
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
      aria-describedby="logout-description"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !isLoggingOut
        ) {
          onClose();
        }
      }}
    >
      <div
        className="
          w-full!
          max-w-sm!
          overflow-hidden!
          rounded-2xl!
          border!
          border-gray-200!
          bg-white!
          shadow-2xl!
          shadow-gray-950/15!
          animate-in!
          fade-in!
          zoom-in-95!
          duration-150!
        "
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex! items-start! justify-between! gap-3! p-4! sm:p-5!">
          <div className="flex! min-w-0! items-start! gap-2.5!">
            <div className="flex! h-9! w-9! shrink-0! items-center! justify-center! rounded-xl! bg-red-50! text-red-500!">
              <LogOut
                size={16}
                strokeWidth={1.9}
              />
            </div>

            <div className="min-w-0!">
              <h3
                id="logout-title"
                className="font-heading! text-sm! font-semibold! tracking-tight! text-gray-900!"
              >
                Sign out of Orion?
              </h3>

              <p
                id="logout-description"
                className="mt-1! text-[10px]! font-medium! leading-relaxed! text-gray-500! sm:text-[11px]!"
              >
                Are you sure you want to end your current session?
              </p>
            </div>
          </div>

          {!isLoggingOut && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="
                flex!
                h-7!
                w-7!
                shrink-0!
                items-center!
                justify-center!
                rounded-lg!
                text-gray-400!
                transition-all!
                duration-150!
                hover:bg-gray-100!
                hover:text-gray-700!
                active:scale-95!
              "
            >
              <X
                size={14}
                strokeWidth={2}
              />
            </button>
          )}
        </div>

        <div className="border-y! border-gray-100! px-4! py-3! sm:px-5!">
          <p className="text-[9px]! font-medium! leading-relaxed! text-gray-500! sm:text-[10px]!">
            You will need to sign in again to access your dashboard.
          </p>
        </div>

        <div className="flex! flex-col-reverse! gap-2! p-4! sm:flex-row! sm:justify-end! sm:p-5!">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            className="
              inline-flex!
              h-10!
              w-full!
              items-center!
              justify-center!
              rounded-xl!
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
              sm:w-auto!
              sm:text-[11px]!
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={
              onConfirm
            }
            disabled={
              isLoggingOut
            }
            className="
              inline-flex!
              h-10!
              w-full!
              items-center!
              justify-center!
              gap-1.5!
              rounded-xl!
              bg-red-600!
              px-4!
              text-[10px]!
              font-semibold!
              text-white!
              transition-all!
              duration-150!
              hover:bg-red-700!
              active:scale-[0.99]!
              disabled:cursor-not-allowed!
              disabled:opacity-60!
              sm:w-auto!
              sm:text-[11px]!
            "
          >
            {isLoggingOut ? (
              <>
                <Loader2
                  size={13}
                  className="animate-spin!"
                />
                Signing out...
              </>
            ) : (
              <>
                <LogOut
                  size={13}
                  strokeWidth={1.9}
                />
                Sign out
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ===========================================================
   SKELETON
=========================================================== */

const SettingsSkeleton = () => {
  return (
    <main className="min-h-full! w-full! bg-[#fafafa]! px-3! py-3! sm:px-4! sm:py-5! lg:px-6! lg:py-6!">
      <div className="mx-auto! w-full! max-w-6xl!">
        {/* Header */}

        <div className="mb-5! space-y-1.5!">
          <div className="skeleton h-5! w-24! rounded-md!" />
          <div className="skeleton h-2.5! w-64! max-w-full! rounded-md!" />
        </div>

        {/* Tabs */}

        <div className="mb-5! flex! gap-5! border-b! border-gray-200!">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="skeleton h-11! w-20! shrink-0! rounded-md!"
            />
          ))}
        </div>

        {/* Main */}

        <div className="overflow-hidden! rounded-2xl! border! border-gray-200! bg-white! shadow-sm!">
          <div className="p-4! sm:p-5!">
            <div className="skeleton h-3.5! w-32! rounded-md!" />

            <div className="skeleton mt-1.5! h-2.5! w-56! max-w-full! rounded-md!" />
          </div>

          <div className="divide-y! divide-gray-200!">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="grid! grid-cols-1! gap-4! p-4! sm:grid-cols-[180px_minmax(0,1fr)]! sm:p-5!"
              >
                <div className="space-y-1.5!">
                  <div className="skeleton h-2.5! w-24! rounded-md!" />
                  <div className="skeleton h-2.5! w-36! max-w-full! rounded-md!" />
                </div>

                <div className="skeleton h-10! w-full! rounded-xl!" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProfileStoreSettings;