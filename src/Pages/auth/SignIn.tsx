import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../../Context/Authcontext";

const SignIn = () => {
  const navigate = useNavigate();

  const { signInUser } = UserAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    const { email, password } = formData;

    // =========================
    // VÉRIFICATION DES CHAMPS
    // =========================

    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
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
        const errorMessage =
          typeof result?.error === "string"
            ? result.error
            : "Unable to sign in.";

        // =========================
        // EMAIL NON VÉRIFIÉ
        // =========================

        if (
          errorMessage.toLowerCase().includes("email not confirmed") ||
          errorMessage.toLowerCase().includes("email not verified")
        ) {
          setError(
            "Please verify your email before signing in."
          );

          return;
        }

        // =========================
        // AUTRE ERREUR
        // =========================

        setError(errorMessage);
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

      setError(
        "Something went wrong. Please try again."
      );
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
          Content de te revoir
          </h1>

          <p className="mx-auto mt-2 max-w-85 text-[12px]! leading-5 text-gray-500 sm:text-[13px]!">
            Connectez-vous pour l'acces à votre tableau de bord.
          </p>

        </div>

        {/* ================= CARD ================= */}

        <div className=" p-4  sm:p-6">

          {/* ================= ERROR ================= */}

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-[11px]! font-medium text-red-600 sm:text-[12px]!">
                {error}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label
                htmlFor="email"
                className="mb-1.5 block text-[11px]! font-medium text-gray-800 sm:text-[12px]!"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
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
                "
              />

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
              {loading
                ? "Connexion..."
                : "Se connecter"}
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