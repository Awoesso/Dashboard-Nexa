import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "@/Context/Authcontext";
import { isStrongPassword, passwordPolicyMessage } from "@/lib/passwordPolicy";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { session, isLoading: authLoading, updatePassword } = UserAuth();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!isStrongPassword(password)) {
      setError(passwordPolicyMessage);
      return;
    }
    if (password !== confirmation) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (!session) {
      setError("Le lien est invalide ou a expiré. Demande un nouveau lien de réinitialisation.");
      return;
    }

    setIsSubmitting(true);
    const result = await updatePassword(password);
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error ?? "La mise à jour a échoué.");
      return;
    }
    navigate("/dashboard", { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <section className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900">Créer un nouveau mot de passe</h1>
        <p className="mt-2 text-sm text-gray-600">{passwordPolicyMessage}</p>
        {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label htmlFor="new-password" className="block text-sm font-medium text-gray-800">Nouveau mot de passe</label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
          />
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-800">Confirmer le mot de passe</label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
          />
          <button type="submit" disabled={isSubmitting || authLoading} className="h-11 w-full rounded-lg bg-blue-900 px-4 text-sm font-semibold text-white disabled:opacity-60">
            {isSubmitting ? "Mise à jour..." : "Mettre à jour le mot de passe"}
          </button>
        </form>
        {!session && !authLoading && <Link to="/forgot-password" className="mt-5 inline-block text-sm font-medium text-blue-700 underline">Demander un nouveau lien</Link>}
      </section>
    </main>
  );
};

export default ResetPassword;
