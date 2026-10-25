import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../../Context/Authcontext";
import AuthFeedback from "./AuthFeedback";

type SignInField = "email" | "password";

const SignIn = () => {
  const navigate = useNavigate();

  const { signInUser, signInWithOAuth } = UserAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<SignInField, string>>>({});
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    if (name === "email" || name === "password") {
      setFieldErrors((current) => ({ ...current, [name]: undefined }));
    }
    setError(null);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError(null);
    const nextErrors: Partial<Record<SignInField, string>> = {};

    const { email, password } = formData;

    if (!email.trim()) {
      nextErrors.email = "Veuillez saisir l’adresse e-mail associée à votre compte.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Veuillez vérifier le format de votre adresse e-mail.";
    }
    if (!password) {
      nextErrors.password = "Veuillez saisir votre mot de passe pour continuer.";
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstInvalidField = Object.keys(nextErrors)[0];
      document.getElementById(firstInvalidField)?.focus();
      return;
    }

    // =========================
    // LOADING
    // =========================

    setLoading(true);

    try {
      // =========================
      // CONNEXION SUPABASE
      // =========================

      const result = await signInUser(
        email.trim(),
        password
      );

      // =========================
      // ERREUR
      // =========================

      if (!result?.success) {
        setError({
          title: "Connexion impossible",
          message:
            "Veuillez vérifier votre adresse e-mail et votre mot de passe. Si vous venez de créer votre compte, confirmez d’abord votre adresse e-mail.",
        });
        return;
      }

      // =========================
      // CONNEXION RÉUSSIE
      // =========================

      navigate("/dashboard");

    } catch (error) {
      // Log only in development to prevent exposing errors in production
      if (import.meta.env.DEV) {
        console.error('Sign in error:', error);
      }

      setError({
        title: "Un problème est survenu",
        message: "Nous ne pouvons pas vous connecter pour le moment. Veuillez réessayer dans quelques instants.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithOAuth("google");
      if (!result.success) {
        setError({
          title: "Connexion Google indisponible",
          message: "Veuillez réessayer dans quelques instants ou vous connecter avec votre adresse e-mail.",
        });
      }
    } catch {
      setError({
        title: "Connexion Google indisponible",
        message: "Veuillez réessayer dans quelques instants ou vous connecter avec votre adresse e-mail.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 sm:py-10">

      <div className="w-full max-w-125">

        {/* ================= LOGO ================= */}

        <div className="mb-6 flex justify-center sm:mb-7">
        
        </div>

        {/* ================= HEADER ================= */}

        <div className="mb-6 text-center sm:mb-7">

          <h1 className="text-2xl! font-semibold tracking-tight text-gray-900 sm:text-4xl! whitespace-nowrap">
          Heureux de vous retrouver
          </h1>

          <p className="mx-auto mt-2 max-w-85 text-[12px]! leading-5 text-gray-500 sm:text-[13px]!">
            Connectez-vous pour accéder à votre espace et retrouver votre activité.
          </p>

        </div>

        {/* ================= CARD ================= */}

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">

          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-5"
            noValidate
          >
            {error && (
              <AuthFeedback
                variant="error"
                title={error.title}
                message={error.message}
                onDismiss={() => setError(null)}
              />
            )}


            {/* EMAIL */}

            <div>

              <label
                htmlFor="email"
                className="mb-1.5 block text-[11px]! font-medium text-gray-800 sm:text-[12px]!"
              >
                Adresse e-mail
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="vous@exemple.com"
                autoComplete="email"
                required
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                className="
                  h-10!
                  w-full
                  rounded-lg
                  border border-gray-200
                  bg-white
                  px-3
                  text-[12px]!
                  text-gray-900
                  outline-none
                  transition
                  placeholder:text-gray-400
                  focus:border-gray-300
                  focus:ring-2
                  focus:ring-blue-500/10
                  sm:h-11!
                  sm:text-[13px]!
                  aria-[invalid=true]:border-red-400
                  aria-[invalid=true]:focus:ring-red-500/10
                "
              />
              {fieldErrors.email && (
                <p id="email-error" className="mt-1.5 text-xs font-medium text-red-700" role="alert">
                  {fieldErrors.email}
                </p>
              )}

            </div>

            {/* PASSWORD */}

            <div>

              <div className="mb-1.5 flex items-center justify-between gap-2">

                <label
                  htmlFor="password"
                  className="text-[11px]! font-medium text-gray-800 sm:text-[12px]!"
                >
                  Mot de passe
                </label>

                <Link
                  to="/forgot-password"
                  className="
                    text-[10px]!
                    font-medium
                    text-blue-600
                    transition
                    hover:text-blue-700
                    sm:text-[11px]!
                  "
                >
                  Mot de passe oublié ?
                </Link>

              </div>

              <div className="relative">

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  className="
                    h-10!
                    w-full
                    rounded-lg
                    border border-gray-200
                    bg-white
                    px-3
                    pr-10
                    text-[12px]!
                    text-gray-900
                    outline-none
                    transition
                    placeholder:text-gray-400
                    focus:border-gray-300
                    focus:ring-2
                    focus:ring-blue-500/10
                    sm:h-11!
                    sm:text-[13px]!
                    aria-[invalid=true]:border-red-400
                    aria-[invalid=true]:focus:ring-red-500/10
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  className="
                    absolute
                    right-2.5
                    top-1/2
                    -translate-y-1/2
                    rounded-md
                    p-1
                    text-gray-400
                    transition
                    hover:bg-gray-50
                    hover:text-gray-700
                  "
                >
                  {showPassword ? (
                    <EyeOff
                      size={16}
                      strokeWidth={1.8}
                    />
                  ) : (
                    <Eye
                      size={16}
                      strokeWidth={1.8}
                    />
                  )}
                </button>

              </div>
              {fieldErrors.password && (
                <p id="password-error" className="mt-1.5 text-xs font-medium text-red-700" role="alert">
                  {fieldErrors.password}
                </p>
              )}

            </div>

            {/* REMEMBER */}

            <div className="flex items-center gap-2">

              <input
                id="remember"
                type="checkbox"
                className="
                  h-3.5!
                  w-3.5!
                  shrink-0
                  rounded
                  border-gray-300
                  text-blue-600
                  focus:ring-blue-500/20
                "
              />

              <label
                htmlFor="remember"
                className="cursor-pointer text-[10px]! text-gray-500 sm:text-[11px]!"
              >
                Se souvenir de moi
              </label>

            </div>

            {/* BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="
                flex
                h-10!
                w-full
                items-center
                justify-center
                rounded-lg
                bg-blue-600
                px-4
                text-[12px]!
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-blue-700
                active:scale-[0.99]
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500/20
                disabled:cursor-not-allowed
                disabled:opacity-60
                sm:h-11!
                sm:text-[13px]!
              "
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>

          </form>

          {/* ================= DIVIDER ================= */}

          <div className="my-5 flex items-center gap-3 sm:my-6">

            <div className="h-px flex-1 bg-gray-100" />

            <span className="text-[9px]! text-gray-400 sm:text-[10px]!">
              OU
            </span>

            <div className="h-px flex-1 bg-gray-100" />

          </div>

          <div className="mb-5">
            <button type="button" onClick={() => void handleGoogleOAuth()} disabled={loading} className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "Connexion à Google…" : "Continuer avec Google"}
            </button>
          </div>

          {/* ================= SIGN UP ================= */}

          <p className="text-center text-[10px]! text-gray-500 sm:text-[11px]!">

            Vous n'avez pas encore de compte ?{" "}

            <Link
              to="/signup"
              className="font-medium text-blue-600! underline hover:text-blue-700!"
            >
              Créer un compte
            </Link>

          </p>

        </div>

        {/* ================= FOOTER ================= */}

        <p className="mx-auto mt-4 max-w-90 text-center text-[9px]! leading-4 text-gray-400 sm:mt-5 sm:text-[10px]!">
          En vous connectant, vous acceptez nos conditions
          d'utilisation et notre politique de confidentialité.
        </p>

      </div>

    </main>
  );
};

export default SignIn;