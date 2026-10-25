import { useState } from "react";
import { Link } from "react-router-dom";
import { UserAuth } from "@/Context/Authcontext";

const ForgotPassword = () => {
  const { requestPasswordReset } = UserAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const result = await requestPasswordReset(email);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError("Nous ne pouvons pas envoyer les instructions pour le moment. Veuillez réessayer dans quelques instants.");
      }
    } catch {
      setError("Nous ne pouvons pas envoyer les instructions pour le moment. Veuillez réessayer dans quelques instants.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <section className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900">Mot de passe oublié</h1>
        <p className="mt-2 text-sm text-gray-600">Veuillez saisir votre adresse e-mail pour recevoir les instructions de réinitialisation.</p>
        {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {submitted ? (
          <p role="status" className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            Si cette adresse e-mail est associée à un compte, un lien de réinitialisation a été envoyé.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label htmlFor="reset-email" className="block text-sm font-medium text-gray-800">Adresse e-mail</label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
            />
            <button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-lg bg-blue-900 px-4 text-sm font-semibold text-white disabled:opacity-60">
              {isSubmitting ? "Envoi..." : "Envoyer les instructions"}
            </button>
          </form>
        )}
        <Link to="/signin" className="mt-5 inline-block text-sm font-medium text-blue-700 underline">Retour à la connexion</Link>
      </section>
    </main>
  );
};

export default ForgotPassword;
