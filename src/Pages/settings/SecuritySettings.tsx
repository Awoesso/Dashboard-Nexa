import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  LogOut,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";

import { UserAuth } from "@/Context/Authcontext";
import AccountSecurityActions from "./AccountSecurityActions";

const SecuritySettings = () => {
  const { session, signOut } = UserAuth();

  const [showLogoutModal, setShowLogoutModal] =
    useState(false);

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  /* =========================================================
     ESCAPE
  ========================================================= */

  useEffect(() => {
    if (!showLogoutModal) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoggingOut) {
        setShowLogoutModal(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [showLogoutModal, isLoggingOut]);

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await signOut();

      setShowLogoutModal(false);
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <section className="w-full! min-w-0!">
        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="mb-6!">
          <div className="flex! items-center! gap-2!">
           

            <h2 className="app-section-title text-gray-900!">
              Security
            </h2>
          </div>

          <p className="mt-1! max-w-xl! text-[10px]! leading-5! text-gray-500! sm:text-[11px]!">
            Manage your account access and current
            session.
          </p>
        </div>

        {/* ===================================================
            SETTINGS
        =================================================== */}

        <div className="divide-y! divide-gray-200! border-y! border-gray-200!">
          {/* =================================================
              ACCOUNT STATUS
          ================================================= */}

          <div className="flex! min-w-0! items-center! justify-between! gap-4! py-5!">
            <div className="flex! min-w-0! items-center! gap-3!">
              <div className="flex! h-8! w-8! shrink-0! items-center! justify-center! rounded-lg! border! border-gray-200! bg-[#fafafa]! text-gray-500!">
                <CheckCircle2
                  size={15}
                  strokeWidth={1.9}
                />
              </div>

              <div className="min-w-0!">
                <p className="text-[11px]! font-semibold! text-gray-900! sm:text-xs!">
                  Account status
                </p>

                <p className="mt-0.5! text-[9px]! leading-4! text-gray-500! sm:text-[10px]!">
                  Your Orion account is authenticated
                  and active.
                </p>
              </div>
            </div>

            <div className="flex! shrink-0! items-center! gap-1.5! text-[9px]! font-semibold! text-green-600!">
              <span className="h-1.5! w-1.5! rounded-full! bg-green-500!" />
              Active
            </div>
          </div>

            <AccountSecurityActions />

          {/* =================================================
              Session actuelle
          ================================================= */}

          <div className="flex! min-w-0! items-center! justify-between! gap-4! py-5!">
            <div className="flex! min-w-0! items-center! gap-3!">
              <div className="flex! h-8! w-8! shrink-0! items-center! justify-center! rounded-lg! border! border-gray-200! bg-[#fafafa]! text-gray-500!">
                <Smartphone
                  size={15}
                  strokeWidth={1.9}
                />
              </div>

              <div className="min-w-0!">
                <p className="text-[11px]! font-semibold! text-gray-900! sm:text-xs!">
                  Session actuelle
                </p>

                <p className="mt-0.5! max-w-full! truncate! text-[9px]! leading-4! text-gray-500! sm:text-[10px]!">
                  {session?.user?.email ||
                    "Authenticated user"}
                </p>
              </div>
            </div>

            <span className="shrink-0! text-[9px]! font-medium! text-gray-400!">
              Actuelle
            </span>
          </div>

          {/* =================================================
              PROTECTION
          ================================================= */}

          <div className="py-5!">
            <div className="flex! min-w-0! items-start! gap-3!">
              <ShieldCheck
                size={15}
                strokeWidth={1.9}
                className="mt-0.5! shrink-0! text-gray-500!"
              />

              <div className="min-w-0!">
                <p className="text-[11px]! font-semibold! text-gray-900! sm:text-xs!">
                  Account protection
                </p>

                <p className="mt-0.5! max-w-2xl! text-[9px]! leading-4! text-gray-500! sm:text-[10px]!">
                  Authentication and active sessions
                  are securely managed by your
                  authentication provider.
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              SIGN OUT
          ================================================= */}

          <div className="flex! min-w-0! flex-col! gap-3! py-5! sm:flex-row! sm:items-center! sm:justify-between!">
            <div className="flex! min-w-0! items-center! gap-3!">
             
              <div className="min-w-0!">
                <p className="text-[11px]! font-semibold! text-gray-900! sm:text-xs!">
                  Sign out
                </p>

                <p className="mt-0.5! text-[9px]! leading-4! text-gray-500! sm:text-[10px]!">
                  End your                   Actuelle Orion session
                  on this device.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowLogoutModal(true)
              }
              className="
                inline-flex!
                h-9!
                w-full!
                shrink-0!
                items-center!
                justify-center!
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
                sm:w-auto!
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

        </div>
      </section>

      {/* =====================================================
          LOGOUT MODAL
      ===================================================== */}

      {showLogoutModal && (
        <div
          className="
            fixed!
            inset-0!
            z-[100]!
            flex!
            items-center!
            justify-center!
            bg-gray-950/40!
            p-4!
            backdrop-blur-md!
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-modal-title"
          aria-describedby="logout-modal-description"
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !isLoggingOut
            ) {
              setShowLogoutModal(false);
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
            {/* Modal header */}

            <div className="flex! items-start! justify-between! gap-3! p-4! sm:p-5!">
              <div className="flex! min-w-0! items-start! gap-3!">
                
                <div className="min-w-0!">
                  <h3
                    id="logout-modal-title"
                    className="font-heading! text-sm! font-semibold! tracking-tight! text-gray-900!"
                  >
                    Sign out of Orion?
                  </h3>

                  <p
                    id="logout-modal-description"
                    className="mt-1! text-[10px]! leading-relaxed! text-gray-500! sm:text-[11px]!"
                  >
                    Are you sure you want to end your
                    current session?
                  </p>
                </div>
              </div>

              {!isLoggingOut && (
                <button
                  type="button"
                  onClick={() =>
                    setShowLogoutModal(false)
                  }
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

            {/* Modal information */}

            <div className="border-y! border-gray-100! bg-[#fafafa]! px-4! py-3! sm:px-5!">
              <div className="flex! items-start! gap-2!">
                <AlertTriangle
                  size={13}
                  className="mt-0.5! shrink-0! text-gray-400!"
                />

                <p className="text-[9px]! leading-relaxed! text-gray-500! sm:text-[10px]!">
                  You will need to sign in again to
                  access your dashboard.
                </p>
              </div>
            </div>

            {/* Modal actions */}

            <div className="flex! flex-col-reverse! gap-2! p-4! sm:flex-row! sm:justify-end! sm:p-5!">
              <button
                type="button"
                onClick={() =>
                  setShowLogoutModal(false)
                }
                disabled={isLoggingOut}
                className="
                  inline-flex!
                  h-10!
                  w-full!
                  items-center!
                  justify-center!
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
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="
                  inline-flex!
                  h-10!
                  w-full!
                  items-center!
                  justify-center!
                  gap-1.5!
                  rounded-lg!
                  bg-red-200!
                  px-4!
                  text-[10px]!
                  font-semibold!
                  text-red-500!
                  transition-all!
                  duration-150!
                  hover:bg-red-300!
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
      )}
    </>
  );
};

export default SecuritySettings;