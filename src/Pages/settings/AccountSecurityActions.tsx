import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "@/Context/Authcontext";
import { supabase } from "@/lib/supabase";

const inputClass = "mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10";
const actionClass = "mt-3 h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50";

const AccountSecurityActions = () => {
  const navigate = useNavigate();
  const { session, signOutOtherSessions } = UserAuth();
  const [newEmail, setNewEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [factors, setFactors] = useState<Array<{ id: string; friendly_name?: string | null }>>([]);
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    let active = true;
    void supabase.auth.mfa.listFactors()
      .then(({ data, error: factorError }) => {
        if (!active) return;
        if (factorError) {
          setError(factorError.message);
          return;
        }
        setFactors(data.totp.filter((factor) => factor.status === "verified"));
      })
      .catch((factorError: unknown) => {
        if (!active) return;
        setError(
          factorError instanceof Error
            ? factorError.message
            : "Impossible de charger les facteurs d’authentification.",
        );
      });
    return () => { active = false; };
  }, []);

  const showResult = (text: string, isError = false) => {
    setError(isError ? text : "");
    setMessage(isError ? "" : text);
  };

  const changeEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    showResult("");
    const { error: updateError } = await supabase.auth.updateUser(
      { email: newEmail.trim() },
      { emailRedirectTo: `${window.location.origin}/dashboard/settings` },
    );
    setBusy(false);
    if (updateError) showResult(updateError.message, true);
    else showResult("Consulte les deux boîtes e-mail et confirme les changements demandés par Supabase.");
  };

  const revokeOtherSessions = async () => {
    setBusy(true);
    showResult("");
    const result = await signOutOtherSessions();
    setBusy(false);
    showResult(result.success ? "Les autres sessions ont été déconnectées." : result.error ?? "Action impossible.", !result.success);
  };

  const startTotp = async () => {
    setBusy(true);
    showResult("");
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Nexa Authenticator",
    });
    setBusy(false);
    if (enrollError) {
      showResult(enrollError.message, true);
      return;
    }
    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
  };

  const verifyTotp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    showResult("");
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      setBusy(false);
      showResult(challengeError.message, true);
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: otp,
    });
    setBusy(false);
    if (verifyError) {
      showResult(verifyError.message, true);
      return;
    }
    setFactors((current) => [...current, { id: factorId, friendly_name: "Nexa Authenticator" }]);
    setFactorId("");
    setQrCode("");
    setSecret("");
    setOtp("");
    showResult("L’authentification à deux facteurs est activée.");
  };

  const removeTotp = async (id: string) => {
    setBusy(true);
    showResult("");
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: id });
    setBusy(false);
    if (unenrollError) showResult(unenrollError.message, true);
    else {
      setFactors((current) => current.filter((factor) => factor.id !== id));
      showResult("Le facteur TOTP a été désactivé.");
    }
  };

  const deleteAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (confirmation !== "SUPPRIMER MON COMPTE") {
      showResult("Saisis exactement SUPPRIMER MON COMPTE pour confirmer.", true);
      return;
    }
    setBusy(true);
    showResult("");
    try {
      const { error: deleteError } = await supabase.functions.invoke("delete-account", {
        body: { confirmation },
      });
      if (deleteError) {
        setBusy(false);
        showResult(deleteError.message, true);
        return;
      }
      await supabase.auth.signOut({ scope: "local" });
      setBusy(false);
      navigate("/signin", { replace: true });
    } catch (deleteError) {
      setBusy(false);
      showResult(deleteError instanceof Error ? deleteError.message : "Suppression impossible.", true);
    }
  };

  return (
    <div className="space-y-6 border-y border-gray-200 py-5">
      <section className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <h3 className="text-xs font-semibold text-gray-900">Changer l’adresse e-mail</h3>
          <p className="mt-1 text-[10px] leading-4 text-gray-500">Adresse actuelle : {session?.user.email ?? "indisponible"}</p>
          <form onSubmit={changeEmail}>
            <label htmlFor="account-new-email" className="mt-3 block text-[10px] font-medium text-gray-700">Nouvelle adresse</label>
            <input id="account-new-email" type="email" autoComplete="email" required value={newEmail} onChange={(event) => setNewEmail(event.target.value)} className={inputClass} />
            <button type="submit" disabled={busy || !newEmail.trim()} className={actionClass}>Demander le changement</button>
          </form>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-gray-900">Authentification à deux facteurs</h3>
          <p className="mt-1 text-[10px] leading-4 text-gray-500">Protégez votre compte à l’aide d’une application compatible avec le protocole TOTP.</p>
          {factors.length ? (
            factors.map((factor) => <div key={factor.id} className="mt-2 flex items-center justify-between gap-2 text-xs"><span>{factor.friendly_name || "Application TOTP"}</span><button type="button" disabled={busy} onClick={() => void removeTotp(factor.id)} className="text-red-700 underline">Désactiver</button></div>)
          ) : (
            <button type="button" disabled={busy || Boolean(factorId)} onClick={() => void startTotp()} className={actionClass}>Configurer TOTP</button>
          )}
          {qrCode && (
            <form onSubmit={verifyTotp} className="mt-3 space-y-2">
              <img src={qrCode} alt="QR code de configuration TOTP" className="h-40 w-40 border border-gray-200 bg-white p-2" />
              <p className="break-all text-[10px] text-gray-600">Clé manuelle : {secret}</p>
              <label htmlFor="totp-code" className="block text-[10px] font-medium">Code de l’application</label>
              <input id="totp-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} className={inputClass} />
              <button type="submit" disabled={busy || otp.length !== 6} className={actionClass}>Vérifier et activer</button>
            </form>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold text-gray-900">Sessions actives</h3>
        <p className="mt-1 text-[10px] leading-4 text-gray-500">La liste détaillée des appareils n’est pas disponible ici. Vous pouvez toutefois révoquer toutes les autres sessions.</p>
        <button type="button" disabled={busy} onClick={() => void revokeOtherSessions()} className={actionClass}>Déconnecter les autres appareils</button>
      </section>

      {(error || message) && <p role={error ? "alert" : "status"} className={`text-xs ${error ? "text-red-700" : "text-green-700"}`}>{error || message}</p>}

      <section className="border-t border-red-200 pt-5">
        <h3 className="text-xs font-semibold text-red-800">Zone dangereuse</h3>
        <p className="mt-1 text-[10px] leading-4 text-gray-600">La suppression de votre compte est irréversible. Les boutiques contenant des commandes seront archivées afin de préserver les données de commande.</p>
        <form onSubmit={deleteAccount} className="mt-3 max-w-md">
          <label htmlFor="delete-confirmation" className="block text-[10px] font-medium text-gray-700">Pour confirmer, veuillez saisir SUPPRIMER MON COMPTE</label>
          <input id="delete-confirmation" required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className={inputClass} />
          <button type="submit" disabled={busy || confirmation !== "SUPPRIMER MON COMPTE"} className="mt-3 h-9 rounded-lg bg-red-700 px-3 text-xs font-semibold text-white disabled:opacity-50">Supprimer mon compte</button>
        </form>
      </section>
    </div>
  );
};

export default AccountSecurityActions;
