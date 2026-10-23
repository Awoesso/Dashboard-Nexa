import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getDashboardData,
  subscribeToDashboard,
  type DashboardData,
} from "@/services/dashboard.service";

/* ============================================================================
   TYPES
============================================================================ */

interface UseDashboardReturn {
  data: DashboardData | null;

  loading: boolean;
  error: string | null;
  refreshKey: number;

  periodOptions: DashboardData["availablePeriods"];

  stats: DashboardData["stats"] | null;
  analytics: DashboardData["analytics"] | null;
  topProducts: DashboardData["topProducts"];
  activities: DashboardData["activities"];

  refresh: () => Promise<void>;

}

/* ============================================================================
   HOOK
============================================================================ */

export const useDashboard =
  (): UseDashboardReturn => {
    const [data, setData] =
      useState<DashboardData | null>(null);

    const [error, setError] =
      useState<string | null>(null);

    const [refreshVersion, setRefreshVersion] = useState(0);

    const mountedRef = useRef(true);
    const requestIdRef = useRef(0);

    const refreshTimerRef =
      useRef<ReturnType<typeof setTimeout> | null>(
        null
      );

    /* ------------------------------------------------------------------------
       Chargement
    ------------------------------------------------------------------------ */

    const refresh = useCallback((): Promise<void> => {
      requestIdRef.current += 1;
      setError(null);
      setRefreshVersion((version) => version + 1);
      return Promise.resolve();
    }, []);

    /* ------------------------------------------------------------------------
       Realtime
    ------------------------------------------------------------------------ */

    useEffect(() => {
      const scheduleRefresh = (): void => {
        if (refreshTimerRef.current) {
          clearTimeout(refreshTimerRef.current);
        }

        /*
         * Petit regroupement des événements Realtime.
         * Exemple :
         * orders INSERT
         * + order_items INSERT
         *
         * => un seul refresh au lieu de deux.
         */
        refreshTimerRef.current = setTimeout(() => {
          if (mountedRef.current) {
            void refresh();
          }
        }, 200);
      };

      const unsubscribe =
        subscribeToDashboard(
          scheduleRefresh
        );

      return () => {
        unsubscribe();

        if (refreshTimerRef.current) {
          clearTimeout(
            refreshTimerRef.current
          );

          refreshTimerRef.current = null;
        }
      };
    }, [refresh]);

    /* ------------------------------------------------------------------------
       Initialisation et actualisation des cartes
    ------------------------------------------------------------------------ */

    useEffect(() => {
      mountedRef.current = true;
      const requestId = ++requestIdRef.current;

      void getDashboardData("30d")
        .then((nextData) => {
          if (mountedRef.current && requestId === requestIdRef.current) {
            setData(nextData);
          }
        })
        .catch((loadError: unknown) => {
          if (!mountedRef.current || requestId !== requestIdRef.current) {
            return;
          }
          console.error("Erreur chargement dashboard :", loadError);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Impossible de charger le dashboard.",
          );
        });

      return () => {
        mountedRef.current = false;
        requestIdRef.current += 1;
      };
    }, [refreshVersion]);

    /* ------------------------------------------------------------------------
       Données exposées
    ------------------------------------------------------------------------ */

    return {
      data,

      loading: data === null && error === null,
      error,
      refreshKey: refreshVersion,

      periodOptions: data?.availablePeriods ?? [],

      stats: data?.stats ?? null,
      analytics:
        data?.analytics ?? null,

      topProducts:
        data?.topProducts ?? [],

      activities:
        data?.activities ?? [],

      refresh,
    };
  };

export default useDashboard;