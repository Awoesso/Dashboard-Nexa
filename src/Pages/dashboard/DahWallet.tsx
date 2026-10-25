import { useCallback, useEffect, useRef, useState } from "react";
import {
  Wallet,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  getWalletSummary,
  type WalletSummary,
} from "@/services/orders.service";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const formatAmount = (amount: number, currency: string): string =>
  `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(amount)} ${currency}`;

const formatRelativeTime = (
  date: string | null
): string => {
  if (!date) {
    return "Aucune activité";
  }

  const createdAt = new Date(date);

  if (Number.isNaN(createdAt.getTime())) {
    return "Date inconnue";
  }

  const now = new Date();

  const difference =
    now.getTime() - createdAt.getTime();

  const seconds = Math.floor(difference / 1000);

  if (seconds < 60) {
    return "À l'instant";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `Il y a ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `Il y a ${hours} h`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return "Hier";
  }

  if (days < 30) {
    return `Il y a ${days} jours`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `Il y a ${months} mois`;
  }

  const years = Math.floor(months / 12);

  return `Il y a ${years} an${years > 1 ? "s" : ""}`;
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const DahWallet = () => {
  const [wallet, setWallet] =
    useState<WalletSummary | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);
  const mountedRef = useRef(false);

  const loadWallet = useCallback(async () => {
    try {
      const data = await getWalletSummary();
      if (mountedRef.current) {
        setWallet(data);
        setError(null);
      }
    } catch (loadError: unknown) {
      console.error("Erreur chargement wallet :", loadError);
      if (mountedRef.current) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger les revenus encaissés.",
        );
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Chargement                                                               */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    mountedRef.current = true;
    void getWalletSummary()
      .then((data) => {
        if (mountedRef.current) {
          setWallet(data);
          setError(null);
        }
      })
      .catch((loadError: unknown) => {
        console.error("Erreur chargement wallet :", loadError);
        if (mountedRef.current) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Impossible de charger les revenus encaissés.",
          );
        }
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false);
      });

    return () => {
      mountedRef.current = false;
    };
  }, [loadWallet]);

  const retryWallet = () => {
    setLoading(true);
    setError(null);
    void loadWallet();
  };

  /* ------------------------------------------------------------------------ */
  /* Données affichées                                                        */
  /* ------------------------------------------------------------------------ */

  const lastActivity = wallet
    ? formatRelativeTime(wallet.lastActivity)
    : "—";

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">

      {/* ================= HEADER ================= */}

      <div className="flex items-center justify-between gap-3">

        <div className="flex min-w-0 items-center gap-2">

          <Wallet
            size={19}
            strokeWidth={1.8}
            className="shrink-0 text-gray-500"
          />

          <span className="truncate text-[14px]! font-semibold text-gray-900">
            Revenus encaissés
          </span>

        </div>

      </div>

      {/* ================= BALANCE ================= */}

      <div
        className="
          mt-4
          rounded-2xl
          border
          border-gray-200
          bg-[#fafafa]
          p-4
          sm:p-5
        "
      >

        <div className="text-center">

          <p className="text-[10px]! font-medium text-gray-500">
            Total des paiements reçus
          </p>

          {loading ? (
            <p className="mt-1 text-[20px]! font-semibold tracking-tight text-gray-900 sm:text-[22px]!">
              —
            </p>
          ) : error ? (
            <p className="mt-1 text-xs font-medium text-red-600">
              Revenus indisponibles
            </p>
          ) : wallet?.balances.length ? (
            <ul className="mt-2 space-y-1">
              {wallet.balances.map(({ currency, amount }) => (
                <li
                  key={currency}
                  className="text-[20px] font-semibold tracking-tight text-gray-900 sm:text-[22px]"
                >
                  {formatAmount(amount, currency)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-[20px]! font-semibold tracking-tight text-gray-900 sm:text-[22px]!">
              0 XOF
            </p>
          )}

        </div>

        <Link
          to="/dashboard/leaderboard"
          className="
            mt-4
            inline-flex
            w-full
            items-center
            justify-center
            gap-1.5
            rounded-lg
            bg-blue-900
            px-4
            py-2.5
            text-[12px]!
            font-semibold
            text-white
            transition-colors
            hover:bg-blue-800
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500/30
            sm:text-[13px]!
          "
        >
          Consulter les commandes
          <ChevronRight size={16} />
        </Link>
        {error && (
          <button
            type="button"
            onClick={retryWallet}
            disabled={loading}
            className="mt-3 w-full text-center text-xs font-medium text-blue-700 underline disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "Actualisation en cours…" : "Réessayer"}
          </button>
        )}

      </div>

      {/* ================= DETAILS ================= */}

      <div className="mt-4 divide-y divide-gray-100 border-t border-gray-100">

        {/* Activity */}

        <div className="flex items-center justify-between gap-4 py-3">

          <div className="flex min-w-0 items-center gap-2">

            <Clock
              size={12}
              strokeWidth={1.8}
              className="shrink-0 text-gray-600"
            />

            <span className="truncate text-[12px]! font-medium text-gray-500">
              Dernière activité
            </span>

          </div>

          <span className="shrink-0 text-[10px]! font-semibold text-gray-700">
            {loading ? "—" : lastActivity}
          </span>

        </div>

      </div>

    </section>
  );
};

export default DahWallet;