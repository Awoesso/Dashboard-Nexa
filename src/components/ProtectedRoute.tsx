import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserAuth } from "@/Context/Authcontext";
import { supabase } from "@/lib/supabase";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

type AccessState =
  | { userId: string; status: "allowed" }
  | { userId: string; status: "challenge"; factorId: string; challengeId: string }
  | { userId: string; status: "error"; message: string };

const LoadingState = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
  </div>
);

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { session, isLoading } = UserAuth();
  const [access, setAccess] = useState<AccessState | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const userId = session?.user.id;

  useEffect(() => {
    if (isLoading || !userId) return;
    let active = true;

    void (async () => {
      try {
        const { data: assurance, error: assuranceError } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (assuranceError) throw assuranceError;

        if (assurance.currentLevel === "aal2" || assurance.nextLevel !== "aal2") {
          if (active) setAccess({ userId, status: "allowed" });
          return;
        }

        const { data: factors, error: factorError } = await supabase.auth.mfa.listFactors();
        if (factorError) throw factorError;
        const factor = factors.totp.find((item) => item.status === "verified");
        if (!factor) throw new Error("Aucun facteur TOTP actif pour ce compte.");

        const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
          factorId: factor.id,
        });
        if (challengeError) throw challengeError;
        if (active) {
          setAccess({ userId, status: "challenge", factorId: factor.id, challengeId: challenge.id });
        }
      } catch (checkError) {
        if (active) {
          setAccess({
            userId,
            status: "error",
            message: checkError instanceof Error ? checkError.message : "Vérification MFA impossible.",
          });
        }
      }
    })();

    return () => { active = false; };
  }, [isLoading, userId]);

  const verifyCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!access || access.status !== "challenge") return;

    setIsVerifying(true);
    setError("");
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: access.factorId,
      challengeId: access.challengeId,
      code,
    });
    setIsVerifying(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    const { data: assurance, error: assuranceError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assuranceError || assurance.currentLevel !== "aal2") {
      setError(assuranceError?.message ?? "Le code n’a pas élevé le niveau de sécurité.");
      return;
    }
    setAccess({ userId: access.userId, status: "allowed" });
  };

  if (isLoading) return <LoadingState />;
  if (!session || !userId) return <Navigate to="/signin" replace />;
  if (!access || access.userId !== userId) return <LoadingState />;
  if (access.status === "allowed") return <>{children}</>;

  if (access.status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <section className="w-full max-w-sm rounded-xl border border-red-200 bg-white p-5">
          <h1 className="text-lg font-semibold text-gray-900">Vérification de sécurité requise</h1>
          <p role="alert" className="mt-2 text-sm text-red-700">{access.message}</p>
          <button type="button" onClick={() => void supabase.auth.signOut()} className="mt-4 text-sm font-medium text-blue-700 underline">Se déconnecter</button>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <section className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-5">
        <h1 className="text-lg font-semibold text-gray-900">Vérification en deux étapes</h1>
        <p className="mt-2 text-sm text-gray-600">Saisis le code affiché par ton application d’authentification.</p>
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        <form onSubmit={verifyCode} className="mt-4 space-y-3">
          <label htmlFor="protected-mfa-code" className="sr-only">Code TOTP</label>
          <input
            id="protected-mfa-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            className="h-11 w-full rounded-lg border border-gray-200 px-3 text-center text-lg tracking-[0.3em] outline-none focus:border-blue-600"
          />
          <button type="submit" disabled={isVerifying || code.length !== 6} className="h-10 w-full rounded-lg bg-blue-900 px-4 text-sm font-semibold text-white disabled:opacity-60">
            {isVerifying ? "Vérification..." : "Vérifier"}
          </button>
        </form>
      </section>
    </main>
  );
};

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { session, isLoading } = UserAuth();
  if (isLoading) return <LoadingState />;
  if (session) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};
