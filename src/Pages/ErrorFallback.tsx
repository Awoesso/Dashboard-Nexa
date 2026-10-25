import { useRouteError, isRouteErrorResponse, Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

/**
 * ErrorFallback component - Page d'erreur globale réactive et accessible
 */
export const ErrorFallback = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  // Extraction propre des métadonnées d'erreur
  const isResponseError = isRouteErrorResponse(error);
  const statusCode = isResponseError ? error.status : 500;
  const statusText = isResponseError ? error.statusText : 'Erreur serveur';
  
  const errorMessage = isResponseError
    ? error.data?.message || 'Une erreur inattendue est survenue.'
    : error instanceof Error
      ? error.message
      : 'Une erreur inattendue est survenue.';

  return (
    <main className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Halo lumineux d'arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="w-125 h-125 bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 sm:p-8 transition-all">
        {/* Header Icon & Status Badge */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 border border-red-100 text-red-600 shadow-inner">
            <AlertTriangle size={32} strokeWidth={2} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-xs font-semibold text-red-700 mb-2">
            <span>Code d'erreur : {statusCode}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {statusText}
          </h1>

          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-sm">
            {errorMessage}
          </p>
        </div>

    
        {/* Actions Réseau & Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full">
          {/* Action 1 : Retour en arrière */}
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm active:scale-[0.98]"
          >
            <ArrowLeft size={16} />
            <span>Retour</span>
          </button>

          {/* Action 2 : Recharger la page */}
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm active:scale-[0.98]"
          >
            <RefreshCw size={16} />
            <span>Réessayer</span>
          </button>
        </div>

        {/* Action Principale : Dashboard (SPA Routing) */}
        <div className="mt-3">
          <Link
            to="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 active:scale-[0.98]"
          >
            <Home size={16} />
            <span>Retour au tableau de bord</span>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default ErrorFallback;