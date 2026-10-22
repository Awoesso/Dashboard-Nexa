import { useState } from "react";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { UserAuth } from "@/Context/Authcontext";

const SignUp = () => {
  const { signUpNewUser } = UserAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
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
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    } = formData;

    // =========================
    // VÉRIFICATION DES CHAMPS
    // =========================

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    // =========================
    // VÉRIFICATION PASSWORD
    // =========================

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // =========================
    // LOADING
    // =========================

    setLoading(true);

    try {
      // =========================
      // INSCRIPTION SUPABASE
      // =========================

      const result = await signUpNewUser(
        email.trim(),
        password,
        firstName.trim(),
        lastName.trim()
      );

      // =========================
      // ERREUR
      // =========================

      if (!result?.success) {
        const errorMessage =
          typeof result?.error === "string"
            ? result.error
            : "Unable to create your account.";

        setError(errorMessage);
        return;
      }

      // =========================
      // INSCRIPTION RÉUSSIE
      // =========================

      setVerificationEmail(email.trim());
      setSignupSuccess(true);

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch {
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // PAGE DE VÉRIFICATION EMAIL
  // ==================================================

  if (signupSuccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 sm:py-10">
        <div className="w-full max-w-105">

          {/* ================= LOGO ================= */}

          <div className="mb-6 flex justify-center sm:mb-7">
           
          </div>

          {/* ================= HEADER ================= */}

          <div className="mb-6 text-center sm:mb-7">
            <h1 className="text-[22px]! font-semibold tracking-tight text-gray-900 sm:text-[24px]!">
              Vérifiez votre email
            </h1>

            <p className="mx-auto mt-2 max-w-85 text-[12px]! leading-5 text-gray-500 sm:text-[13px]!">
              Nous avons envoyé un lien de vérification
              à votre adresse email.
            </p>
          </div>

          {/* ================= CARD ================= */}

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">

            {/* ================= ICON ================= */}

            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                <MailCheck
                  size={26}
                  strokeWidth={1.8}
                  className="text-blue-600"
                />
              </div>
            </div>

            {/* ================= MESSAGE ================= */}

            <div className="mt-5 text-center">

              <h2 className="text-[15px]! font-semibold text-gray-900">
                Confirmez votre adresse
              </h2>

              <p className="mx-auto mt-2 max-w-82.5 text-[11px]! leading-5 text-gray-500 sm:text-[12px]!">
                Cliquez sur le lien envoyé à
              </p>

              <p className="mt-1 break-all text-[11px]! font-semibold text-gray-900 sm:text-[12px]!">
                {verificationEmail}
              </p>

              <p className="mx-auto mt-3 max-w-82.5 text-[10px]! leading-5 text-gray-400 sm:text-[11px]!">
                Après avoir vérifié votre adresse email,
                vous pourrez vous connecter à votre compte.
              </p>

            </div>

            {/* ================= DIVIDER ================= */}

            <div className="my-5 h-px bg-gray-100 sm:my-6" />

            {/* ================= SIGN IN ================= */}

            <p className="text-center text-[10px]! text-gray-500 sm:text-[11px]!">
              Vous avez déjà vérifié votre email ?{" "}

              <Link
                to="/signin"
                className="font-medium text-blue-600! underline hover:text-blue-700!"
              >
                Se connecter
              </Link>
            </p>

          </div>

          {/* ================= FOOTER ================= */}

          <p className="mx-auto mt-4 max-w-90 text-center text-[9px]! leading-4 text-gray-400 sm:mt-5 sm:text-[10px]!">
            Si vous ne trouvez pas l'email, vérifiez
            également votre dossier spam.
          </p>

        </div>
      </main>
    );
  }

  // ==================================================
  // PAGE SIGN UP
  // ==================================================

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 sm:py-10">
      <div className="w-full max-w-125">

        {/* ================= LOGO ================= */}

        <div className="mb-6 flex justify-center sm:mb-7">
        
        </div>

        {/* ================= HEADER ================= */}

        <div className="mb-6 text-center sm:mb-7">
          <h1 className="text-[22px]! font-semibold tracking-tight text-gray-900 sm:text-[24px]!">
            Créez votre compte
          </h1>

          <p className="mx-auto mt-2 max-w-85 text-[12px]! leading-5 text-gray-500 sm:text-[13px]!">
            Créez un compte pour accéder à votre tableau de bord.
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

            {/* ================= NAME ================= */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* FIRST NAME */}

              <div>
                <label
                  htmlFor="firstName"
                  className="mb-1.5 block text-[11px]! font-medium text-gray-800 sm:text-[12px]!"
                >
                  Prénom
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  autoComplete="given-name"
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

              {/* LAST NAME */}

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-1.5 block text-[11px]! font-medium text-gray-800 sm:text-[12px]!"
                >
                  Nom de famille
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Aneme"
                  autoComplete="family-name"
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

            </div>

            {/* ================= EMAIL ================= */}

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

            {/* ================= PASSWORD ================= */}

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[11px]! font-medium text-gray-800 sm:text-[12px]!"
              >
                Mot de passe
              </label>

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
                  autoComplete="new-password"
                  required
                  minLength={6}
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
                  className="
                    absolute
                    right-2.5
                    top-1/2
                    -translate-y-1/2
                    rounded-md
                    p-1
                    text-gray-400
                    hover:bg-gray-50
                    hover:text-gray-700
                  "
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>

              </div>

              <p className="mt-1.5 text-[9px]! text-gray-400 sm:text-[10px]!">
                Minimum 6 caractères.
              </p>
            </div>

            {/* ================= CONFIRM PASSWORD ================= */}

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-[11px]! font-medium text-gray-800 sm:text-[12px]!"
              >
                Confirmer le mot de passe
              </label>

              <div className="relative">

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
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
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  className="
                    absolute
                    right-2.5
                    top-1/2
                    -translate-y-1/2
                    rounded-md
                    p-1
                    text-gray-400
                    hover:bg-gray-50
                    hover:text-gray-700
                  "
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>

              </div>
            </div>

            {/* ================= SUBMIT ================= */}

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
                bg-blue-900
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
                ? "Création..."
                : "Créer un compte"}
            </button>

          </form>

          {/* ================= DIVIDER ================= */}

          <div className="my-5 h-px bg-gray-100 sm:my-6" />

          {/* ================= SIGN IN ================= */}

          <p className="text-center text-[10px]! text-gray-500 sm:text-[11px]!">
            Vous avez déjà un compte ?{" "}

            <Link
              to="/signin"
              className="font-medium text-blue-600! underline hover:text-blue-700!"
            >
              Connexion
            </Link>
          </p>

        </div>

        {/* ================= FOOTER ================= */}

        <p className="mx-auto mt-4 max-w-90 text-center text-[9px]! leading-4 text-gray-400 sm:mt-5 sm:text-[10px]!">
          En créant un compte, vous acceptez nos conditions
          d'utilisation et notre politique de confidentialité.
        </p>

      </div>
    </main>
  );
};

export default SignUp;