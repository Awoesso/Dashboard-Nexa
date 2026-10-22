import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getOrders,
  subscribeToOrders,
  type Order,
} from "@/services/orders.service";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type OrderPeriod =
  | "today"
  | "7d"
  | "30d"
  | "90d"
  | "1y"
  | "all";

export interface OrderStats {
  ordersCount: number;
  revenue: number;
  pendingOrders: number;
  averageOrder: number;

  ordersChange: number | null;
  revenueChange: number | null;
  pendingChange: number | null;
  averageOrderChange: number | null;
}

export interface OrderPeriodOption {
  key: OrderPeriod;
  label: string;
  days: number | null;
}

interface UseOrdersReturn {
  orders: Order[];

  loading: boolean;
  error: string | null;

  selectedPeriod: OrderPeriod;
  setSelectedPeriod: (period: OrderPeriod) => void;

  stats: OrderStats;

  periodOptions: OrderPeriodOption[];

  refresh: () => Promise<void>;
}

/* -------------------------------------------------------------------------- */
/* Périodes                                                                   */
/* -------------------------------------------------------------------------- */

export const ORDER_PERIODS: OrderPeriodOption[] = [
  {
    key: "today",
    label: "Aujourd'hui",
    days: 1,
  },
  {
    key: "7d",
    label: "7 jours",
    days: 7,
  },
  {
    key: "30d",
    label: "30 jours",
    days: 30,
  },
  {
    key: "90d",
    label: "90 jours",
    days: 90,
  },
  {
    key: "1y",
    label: "1 an",
    days: 365,
  },
  {
    key: "all",
    label: "Depuis le début",
    days: null,
  },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Une erreur est survenue.";
};

const sortOrders = (orders: Order[]): Order[] => {
  return [...orders].sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  );
};

const isCancelled = (order: Order): boolean => {
  return order.order_status === "cancelled";
};

const isPending = (order: Order): boolean => {
  return order.order_status === "pending";
};

/* -------------------------------------------------------------------------- */
/* Dates                                                                      */
/* -------------------------------------------------------------------------- */

const getStartDate = (
  period: OrderPeriod,
  now: Date
): Date | null => {
  if (period === "all") {
    return null;
  }

  const start = new Date(now);

  switch (period) {
    case "today":
      start.setHours(0, 0, 0, 0);
      return start;

    case "7d":
      start.setDate(start.getDate() - 7);
      return start;

    case "30d":
      start.setDate(start.getDate() - 30);
      return start;

    case "90d":
      start.setDate(start.getDate() - 90);
      return start;

    case "1y":
      start.setFullYear(start.getFullYear() - 1);
      return start;

    default:
      return null;
  }
};

const getPreviousPeriodStart = (
  period: OrderPeriod,
  currentStart: Date | null
): Date | null => {
  if (period === "all" || !currentStart) {
    return null;
  }

  const previousStart = new Date(currentStart);

  switch (period) {
    case "today":
      previousStart.setDate(previousStart.getDate() - 1);
      break;

    case "7d":
      previousStart.setDate(previousStart.getDate() - 7);
      break;

    case "30d":
      previousStart.setDate(previousStart.getDate() - 30);
      break;

    case "90d":
      previousStart.setDate(previousStart.getDate() - 90);
      break;

    case "1y":
      previousStart.setFullYear(previousStart.getFullYear() - 1);
      break;
  }

  return previousStart;
};

/* -------------------------------------------------------------------------- */
/* Filtrage                                                                   */
/* -------------------------------------------------------------------------- */

const filterOrdersByPeriod = (
  orders: Order[],
  start: Date | null,
  end: Date
): Order[] => {
  return orders.filter((order) => {
    const createdAt = new Date(order.created_at);

    if (Number.isNaN(createdAt.getTime())) {
      return false;
    }

    if (start && createdAt < start) {
      return false;
    }

    return createdAt <= end;
  });
};

/* -------------------------------------------------------------------------- */
/* Calcul statistiques                                                        */
/* -------------------------------------------------------------------------- */

const calculateStats = (orders: Order[]): Omit<
  OrderStats,
  | "ordersChange"
  | "revenueChange"
  | "pendingChange"
  | "averageOrderChange"
> => {
  const validOrders = orders.filter((order) => !isCancelled(order));

  const ordersCount = validOrders.length;

  const revenue = validOrders.reduce(
    (total, order) => total + Number(order.total_amount || 0),
    0
  );

  const pendingOrders = orders.filter(isPending).length;

  const averageOrder =
    ordersCount > 0 ? revenue / ordersCount : 0;

  return {
    ordersCount,
    revenue,
    pendingOrders,
    averageOrder,
  };
};

/* -------------------------------------------------------------------------- */
/* Pourcentage                                                                */
/* -------------------------------------------------------------------------- */

const calculatePercentageChange = (
  current: number,
  previous: number
): number | null => {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return ((current - previous) / previous) * 100;
};

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

export const useOrders = (): UseOrdersReturn => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPeriod, setSelectedPeriod] =
    useState<OrderPeriod>("30d");

  /* ------------------------------------------------------------------------ */
  /* Chargement                                                                */
  /* ------------------------------------------------------------------------ */

  const refresh = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      const data = await getOrders();

      setOrders(sortOrders(data));
    } catch (error: unknown) {
      console.error("Erreur récupération commandes :", error);

      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Initialisation + Realtime                                                 */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true;

    const loadOrders = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const data = await getOrders();

        if (mounted) {
          setOrders(sortOrders(data));
        }
      } catch (error: unknown) {
        console.error("Erreur chargement commandes :", error);

        if (mounted) {
          setError(getErrorMessage(error));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadOrders();

    const unsubscribe = subscribeToOrders(
      /* INSERT */
      (newOrder) => {
        if (!mounted) return;

        setOrders((currentOrders) => {
          const exists = currentOrders.some(
            (order) => order.store_order_id === newOrder.store_order_id
          );

          if (exists) {
            return currentOrders;
          }

          return sortOrders([
            newOrder,
            ...currentOrders,
          ]);
        });
      },

      /* UPDATE */
      (updatedOrder) => {
        if (!mounted) return;

        setOrders((currentOrders) =>
          sortOrders(
            currentOrders.map((order) =>
              order.store_order_id === updatedOrder.store_order_id
                ? updatedOrder
                : order
            )
          )
        );
      },

      /* DELETE */
      (deletedOrderId) => {
        if (!mounted) return;

        setOrders((currentOrders) =>
          currentOrders.filter(
            (order) => order.store_order_id !== deletedOrderId
          )
        );
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Options de période disponibles                                           */
  /* ------------------------------------------------------------------------ */

  const periodOptions = useMemo(() => {
    if (orders.length === 0) {
      return ORDER_PERIODS;
    }

    const oldestOrder = orders.reduce(
      (oldest, order) => {
        const date = new Date(order.created_at);

        if (Number.isNaN(date.getTime())) {
          return oldest;
        }

        return date < oldest ? date : oldest;
      },
      new Date(orders[0].created_at)
    );

    const ageInDays =
      Math.floor(
        (Date.now() - oldestOrder.getTime()) /
          (1000 * 60 * 60 * 24)
      );

    return ORDER_PERIODS.filter((period) => {
      if (period.key === "today") {
        return true;
      }

      if (period.key === "all") {
        return true;
      }

      return period.days !== null && ageInDays >= period.days;
    });
  }, [orders]);

  /* ------------------------------------------------------------------------ */
  /* Statistiques                                                              */
  /* ------------------------------------------------------------------------ */

  const stats = useMemo<OrderStats>(() => {
    const now = new Date();

    const currentStart = getStartDate(
      selectedPeriod,
      now
    );

    const previousStart = getPreviousPeriodStart(
      selectedPeriod,
      currentStart
    );

    const currentOrders = filterOrdersByPeriod(
      orders,
      currentStart,
      now
    );

    const previousOrders =
      previousStart && currentStart
        ? filterOrdersByPeriod(
            orders,
            previousStart,
            currentStart
          )
        : [];

    const current = calculateStats(currentOrders);

    const previous = calculateStats(previousOrders);

    return {
      ...current,

      ordersChange:
        selectedPeriod === "all"
          ? null
          : calculatePercentageChange(
              current.ordersCount,
              previous.ordersCount
            ),

      revenueChange:
        selectedPeriod === "all"
          ? null
          : calculatePercentageChange(
              current.revenue,
              previous.revenue
            ),

      pendingChange:
        selectedPeriod === "all"
          ? null
          : calculatePercentageChange(
              current.pendingOrders,
              previous.pendingOrders
            ),

      averageOrderChange:
        selectedPeriod === "all"
          ? null
          : calculatePercentageChange(
              current.averageOrder,
              previous.averageOrder
            ),
    };
  }, [orders, selectedPeriod]);

  /* ------------------------------------------------------------------------ */
  /* Return                                                                    */
  /* ------------------------------------------------------------------------ */

  return {
    orders,
    loading,
    error,

    selectedPeriod,
    setSelectedPeriod,

    stats,

    periodOptions,

    refresh,
  };
};

export default useOrders;