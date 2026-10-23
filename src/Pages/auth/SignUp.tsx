import { useState } from "react";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "@/Context/Authcontext";
import { isStrongPassword, passwordPolicyMessage } from "@/lib/passwordPolicy";
import AuthFeedback from "./AuthFeedback";

type SignUpField =
  | "firstName"
  | "lastName"
  | "email"
  | "password"
  | "confirmPassword";

const SignUp = () => {
  const {
    signUpNewUser,
    verifySignupOtp,
    resendSignupOtp,
    signInWithOAuth,
  } = UserAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<SignUpField, string>>>({});
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [otp, setOtp] = useState("");

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

    if (
      name === "firstName" ||
      name === "lastName" ||
      name === "email" ||
      name === "password" ||
      name === "confirmPassword"
    ) {
      setFieldErrors((current) => ({
        ...current,
        [name]: undefined,
        ...(name === "password" ? { confirmPassword: undefined } : {}),
      }));
    }
    setError(null);
    setNotice("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError(null);
    const nextErrors: Partial<Record<SignUpField, string>> = {};

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

    if (!firstName.trim()) nextErrors.firstName = "Renseigne ton prénom.";
    if (!lastName.trim()) nextErrors.lastName = "Renseigne ton nom.";
    if (!email.trim()) {
      nextErrors.email = "Saisis une adresse e-mail pour recevoir ton code de confirmation.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Vérifie le format de ton adresse e-mail.";
    }
    if (!password) {
      nextErrors.password = "Choisis un mot de passe pour sécuriser ton compte.";
    } else if (!isStrongPassword(password)) {
      nextErrors.password = passwordPolicyMessage;
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = "Saisis à nouveau ton mot de passe.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Les deux mots de passe ne correspondent pas.";
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
        setError({
          title: "Création du compte impossible",
          message:
            "Vérifie les informations saisies et réessaie. Si le problème persiste, patiente quelques instants avant une nouvelle tentative.",
        });
        return;
      }

      const responseData = result.data as { session?: unknown } | undefined;
      if (responseData?.session) {
        navigate("/dashboard");
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
      setError({
        title: "Un problème est survenu",
        message: "Ton compte n’a pas pu être créé. Réessaie dans quelques instants.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice("");
    setLoading(true);

    try {
      const result = await verifySignupOtp(verificationEmail, otp);
      if (result.success) {
        navigate("/dashboard");
      } else {
        setError({
          title: "Code non validé",
          message: "Vérifie les 6 chiffres saisis. Le code peut avoir expiré ; tu peux en demander un nouveau.",
        });
      }
    } catch {
      setError({
        title: "Vérification indisponible",
        message: "Nous n’avons pas pu vérifier le code. Réessaie dans quelques instants.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setNotice("");
    setLoading(true);
    try {
      const result = await resendSignupOtp(verificationEmail);
      if (!result.success) {
        setError({
          title: "Envoi du code impossible",
          message: "Un code récent a peut-être déjà été envoyé. Attends un instant puis réessaie.",
        });
      } else {
        setNotice("Un nouveau code vient d’être envoyé. Pense aussi à vérifier tes courriers indésirables.");
      }
    } catch {
      setError({
        title: "Envoi du code impossible",
        message: "Nous n’avons pas pu envoyer le code. Réessaie dans quelques instants.",
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
          title: "Inscription Google indisponible",
          message: "Réessaie dans quelques instants ou crée ton compte avec ton adresse e-mail.",
        });
      }
    } catch {
      setError({
        title: "Inscription Google indisponible",
        message: "Réessaie dans quelques instants ou crée ton compte avec ton adresse e-mail.",
      });
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
              Vérifie ton adresse e-mail
            </h1>

            <p className="mx-auto mt-2 max-w-85 text-[12px]! leading-5 text-gray-500 sm:text-[13px]!">
              Saisis le code à 6 chiffres envoyé à ton adresse e-mail.
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
              {fieldErrors.confirmPassword && <p id="confirmPassword-error" role="alert" className="mt-1.5 text-xs font-medium text-red-700">{fieldErrors.confirmPassword}</p>}
            </div>

            {/* ================= MESSAGE ================= */}

            <div className="mt-5 text-center">

              <h2 className="text-[15px]! font-semibold text-gray-900">
                Confirme ton adresse
              </h2>

              <p className="mx-auto mt-2 max-w-82.5 text-[11px]! leading-5 text-gray-500 sm:text-[12px]!">
                Code envoyé à
              </p>

              <p className="mt-1 break-all text-[11px]! font-semibold text-gray-900 sm:text-[12px]!">
                {verificationEmail}
              </p>

              <p className="mx-auto mt-3 max-w-82.5 text-[10px]! leading-5 text-gray-400 sm:text-[11px]!">
                Saisis le code reçu pour confirmer ton adresse et accéder à ton compte.
              </p>

            </div>

            {/* ================= DIVIDER ================= */}

            <div className="my-5 h-px bg-gray-100 sm:my-6" />

            {/* ================= SIGN IN ================= */}

            {error && (
              <AuthFeedback
                variant="error"
                title={error.title}
                message={error.message}
                onDismiss={() => setError(null)}
              />
            )}
            {notice && (
              <AuthFeedback
                variant="success"
                title="Code envoyé"
                message={notice}
              />
            )}
            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <label htmlFor="signup-otp" className="block text-sm font-medium text-gray-800">
                Code de vérification
              </label>
              <input
                id="signup-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={otp}
                onChange={(event) => {
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                  setError(null);
                }}
                placeholder="123456"
                aria-label="Code de vérification à six chiffres"
                className="h-12 w-full rounded-lg border border-gray-200 bg-white px-3 text-center text-xl font-semibold tracking-[0.45em] text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
              {otp.length > 0 && otp.length < 6 && (
                <p className="text-xs text-gray-500" role="status">
                  Encore {6 - otp.length} chiffre{6 - otp.length > 1 ? "s" : ""} à saisir.
                </p>
              )}
              <button type="submit" disabled={loading || otp.length !== 6} className="h-11 w-full rounded-lg bg-blue-900 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Vérification..." : "Vérifier le code"}
              </button>
            </form>
            <button type="button" onClick={handleResendOtp} disabled={loading} className="mt-4 w-full text-sm font-medium text-blue-700 underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "Veuillez patienter…" : "Je n’ai pas reçu le code — le renvoyer"}
            </button>

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

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">

          {error && (
            <AuthFeedback
              variant="error"
              title={error.title}
              message={error.message}
              onDismiss={() => setError(null)}
            />
          )}

          <div className="mb-5">
            <button type="button" onClick={() => void handleGoogleOAuth()} disabled={loading} className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "Connexion à Google…" : "Continuer avec Google"}
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-5"
            noValidate
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
                  aria-invalid={Boolean(fieldErrors.firstName)}
                  aria-describedby={fieldErrors.firstName ? "firstName-error" : undefined}
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
                {fieldErrors.firstName && <p id="firstName-error" role="alert" className="mt-1.5 text-xs font-medium text-red-700">{fieldErrors.firstName}</p>}
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
                  aria-invalid={Boolean(fieldErrors.lastName)}
                  aria-describedby={fieldErrors.lastName ? "lastName-error" : undefined}
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
                {fieldErrors.lastName && <p id="lastName-error" role="alert" className="mt-1.5 text-xs font-medium text-red-700">{fieldErrors.lastName}</p>}
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
                placeholder="vous@exemple.com"
                autoComplete="email"
                required
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
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
              {fieldErrors.email && <p id="signup-email-error" role="alert" className="mt-1.5 text-xs font-medium text-red-700">{fieldErrors.email}</p>}
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
                  minLength={8}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "password-policy signup-password-error" : "password-policy"}
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

              <p id="password-policy" className="mt-1.5 text-[10px]! leading-4 text-gray-500 sm:text-[11px]!">
                8 caractères minimum, avec une majuscule et un chiffre.
              </p>
              {fieldErrors.password && <p id="signup-password-error" role="alert" className="mt-1.5 text-xs font-medium text-red-700">{fieldErrors.password}</p>}
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
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
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