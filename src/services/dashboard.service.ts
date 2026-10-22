import { supabase } from "@/lib/supabase";
import { getOrders, type Order, type OrderItem } from "./orders.service";

/* ============================================================================
   TYPES
============================================================================ */

export type DashboardPeriod =
  | "today"
  | "7d"
  | "30d"
  | "90d"
  | "1y"
  | "all";

export interface DashboardPeriodOption {
  key: DashboardPeriod;
  label: string;
  days: number | null;
}

export interface DashboardStats {
  totalEarnings: number;
  totalOrders: number;
  products: number;
  totalSales: number;

  earningsChange: number | null;
  ordersChange: number | null;
  productsChange: number | null;
  salesChange: number | null;

  pendingOrders: number;
  averageOrder: number;

  averageOrderChange: number | null;
  pendingChange: number | null;

  currency: string;
}

export interface DashboardChartPoint {
  label: string;
  earnings: number;
  orders: number;
}

export interface DashboardAnalytics {
  period: DashboardPeriod;
  points: DashboardChartPoint[];
  totalEarnings: number;
  totalOrders: number;
  currency: string;
}

export interface DashboardTopProduct {
  id: string;
  name: string;
  price: number;
  sales: number;
  earnings: number;
  currency: string;
  status: string | null;
  coverImageUrl: string | null;
}

export type DashboardActivityType =
  | "order"
  | "notification"
  | "payment";

export interface DashboardActivity {
  id: string;
  type: DashboardActivityType;
  title: string;
  description: string;
  createdAt: string;
  metadata: Record<string, unknown> | null;
}

export interface DashboardData {
  stats: DashboardStats;
  analytics: DashboardAnalytics;
  topProducts: DashboardTopProduct[];
  activities: DashboardActivity[];
  storeCreatedAt: string | null;
  availablePeriods: DashboardPeriodOption[];
}

/* ============================================================================
   CONSTANTES
============================================================================ */

export const DASHBOARD_PERIODS: DashboardPeriodOption[] = [
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

/* ============================================================================
   TYPES INTERNES SUPABASE
============================================================================ */

interface DashboardProductRow {
  id: string;
  name: string;
  price: number | string;
  currency: string;
  status: string;
  cover_image_url: string | null;
  created_at: string;
}

interface DashboardNotificationRow {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface DashboardProfileRow {
  created_at: string | null;
}

interface DashboardSnapshot {
  orders: Order[];
  orderItems: OrderItem[];
  products: DashboardProductRow[];
  notifications: DashboardNotificationRow[];
  storeCreatedAt: string | null;
}

/* ============================================================================
   HELPERS
============================================================================ */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const safeNumber = (value: unknown): number => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const safeDate = (value: string): Date | null => {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfDay = (date: Date): Date => {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
};

const endOfDay = (date: Date): Date => {
  const result = startOfDay(date);

  result.setDate(result.getDate() + 1);

  return result;
};

const startOfWeek = (date: Date): Date => {
  const result = startOfDay(date);

  const day = result.getDay();

  const diff = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + diff);

  return result;
};

const startOfMonth = (date: Date): Date => {
  const result = new Date(date);

  result.setDate(1);
  result.setHours(0, 0, 0, 0);

  return result;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);

  result.setDate(result.getDate() + days);

  return result;
};

const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);

  result.setMonth(result.getMonth() + months);

  return result;
};

const getDateDifferenceInDays = (
  start: string | null,
  end: Date = new Date()
): number => {
  if (!start) return 0;

  const startDate = safeDate(start);

  if (!startDate) return 0;

  return Math.max(
    0,
    Math.floor((end.getTime() - startDate.getTime()) / MS_PER_DAY)
  );
};

const isCancelledOrder = (order: Order): boolean => {
  return order.order_status.toLowerCase() === "cancelled";
};

const isPendingOrder = (order: Order): boolean => {
  return order.order_status.toLowerCase() === "pending";
};

/**
 * Revenu dashboard :
 * toutes les commandes sauf les commandes annulées.
 */
const isRevenueOrder = (order: Order): boolean => {
  return !isCancelledOrder(order);
};

const calculatePercentageChange = (
  current: number,
  previous: number,
  comparable: boolean = true
): number | null => {
  if (!comparable) {
    return null;
  }

  if (previous === 0) {
    if (current === 0) {
      return 0;
    }

    return null;
  }

  return ((current - previous) / previous) * 100;
};

const getCurrency = (
  orders: Order[],
  fallback: string = "XOF"
): string => {
  const currency = orders.find(
    (order) => typeof order.currency === "string" && order.currency
  )?.currency;

  return currency || fallback;
};

/* ============================================================================
   PÉRIODES
============================================================================ */

interface PeriodWindow {
  currentStart: Date;
  currentEnd: Date;
  previousStart: Date | null;
  previousEnd: Date | null;
  comparable: boolean;
}

const getPeriodWindow = (
  period: DashboardPeriod,
  now: Date,
  storeCreatedAt: string | null
): PeriodWindow => {
  switch (period) {
    case "today": {
      const currentStart = startOfDay(now);
      const currentEnd = endOfDay(now);

      const previousStart = addDays(currentStart, -1);
      const previousEnd = currentStart;

      const comparable =
        !storeCreatedAt ||
        (() => {
          const storeDate = safeDate(storeCreatedAt);

          return storeDate
            ? storeDate < currentStart
            : false;
        })();

      return {
        currentStart,
        currentEnd,
        previousStart,
        previousEnd,
        comparable,
      };
    }

    case "7d": {
      const currentEnd = now;
      const currentStart = addDays(now, -7);

      const previousEnd = currentStart;
      const previousStart = addDays(currentStart, -7);

      const comparable =
        !storeCreatedAt ||
        (() => {
          const storeDate = safeDate(storeCreatedAt);

          return storeDate
            ? storeDate < currentStart
            : false;
        })();

      return {
        currentStart,
        currentEnd,
        previousStart,
        previousEnd,
        comparable,
      };
    }

    case "30d": {
      const currentEnd = now;
      const currentStart = addDays(now, -30);

      const previousEnd = currentStart;
      const previousStart = addDays(currentStart, -30);

      const comparable =
        !storeCreatedAt ||
        (() => {
          const storeDate = safeDate(storeCreatedAt);

          return storeDate
            ? storeDate < currentStart
            : false;
        })();

      return {
        currentStart,
        currentEnd,
        previousStart,
        previousEnd,
        comparable,
      };
    }

    case "90d": {
      const currentEnd = now;
      const currentStart = addDays(now, -90);

      const previousEnd = currentStart;
      const previousStart = addDays(currentStart, -90);

      const comparable =
        !storeCreatedAt ||
        (() => {
          const storeDate = safeDate(storeCreatedAt);

          return storeDate
            ? storeDate < currentStart
            : false;
        })();

      return {
        currentStart,
        currentEnd,
        previousStart,
        previousEnd,
        comparable,
      };
    }

    case "1y": {
      const currentEnd = now;
      const currentStart = addDays(now, -365);

      const previousEnd = currentStart;
      const previousStart = addDays(currentStart, -365);

      const comparable =
        !storeCreatedAt ||
        (() => {
          const storeDate = safeDate(storeCreatedAt);

          return storeDate
            ? storeDate < currentStart
            : false;
        })();

      return {
        currentStart,
        currentEnd,
        previousStart,
        previousEnd,
        comparable,
      };
    }

    case "all":
    default: {
      const storeDate = safeDate(storeCreatedAt ?? "");

      return {
        currentStart: storeDate ?? new Date(0),
        currentEnd: now,
        previousStart: null,
        previousEnd: null,
        comparable: false,
      };
    }
  }
};

export const getAvailableDashboardPeriods = (
  storeCreatedAt: string | null
): DashboardPeriodOption[] => {
  if (!storeCreatedAt) {
    return DASHBOARD_PERIODS;
  }

  const ageInDays = getDateDifferenceInDays(storeCreatedAt);

  return DASHBOARD_PERIODS.filter((period) => {
    if (period.key === "today") return true;

    if (period.key === "all") return true;

    if (period.days === null) return true;

    return ageInDays >= period.days;
  });
};

/* ============================================================================
   FILTRES
============================================================================ */

const filterOrders = (
  orders: Order[],
  start: Date,
  end: Date
): Order[] => {
  return orders.filter((order) => {
    const date = safeDate(order.created_at);

    if (!date) return false;

    return date >= start && date < end;
  });
};

const filterOrderItems = (
  items: OrderItem[],
  validOrders: Order[]
): OrderItem[] => {
  const validOrderStoreKeys = new Set(
    validOrders.map((order) => `${order.order_id}:${order.store_id}`)
  );

  return items.filter(
    (item) =>
      item.store_id !== null &&
      validOrderStoreKeys.has(`${item.order_id}:${item.store_id}`)
  );
};

/* ============================================================================
   STATS COMMANDES
============================================================================ */

interface PeriodStats {
  orders: number;
  earnings: number;
  pendingOrders: number;
  averageOrder: number;
  sales: number;
}

const calculatePeriodStats = (
  orders: Order[],
  orderItems: OrderItem[]
): PeriodStats => {
  const validOrders = orders.filter(isRevenueOrder);

  const earnings = validOrders.reduce(
    (total, order) => total + safeNumber(order.total_amount),
    0
  );

  const pendingOrders = orders.filter(isPendingOrder).length;

  const averageOrder =
    validOrders.length > 0
      ? earnings / validOrders.length
      : 0;

  const sales = filterOrderItems(
    orderItems,
    validOrders
  ).reduce(
    (total, item) => total + safeNumber(item.quantity),
    0
  );

  return {
    orders: validOrders.length,
    earnings,
    pendingOrders,
    averageOrder,
    sales,
  };
};

/* ============================================================================
   SNAPSHOT SUPABASE
============================================================================ */

const getStoreCreatedAt = async (): Promise<string | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.warn(
      "Impossible de récupérer la date de création du profil :",
      error
    );

    return null;
  }

  return (data as DashboardProfileRow | null)?.created_at ?? null;
};

interface DashboardStoreProductsRow {
  products: DashboardProductRow[] | null;
}

const getDashboardProducts = async (): Promise<DashboardProductRow[]> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("stores")
    .select(`
      products (
        id,
        name,
        price,
        currency,
        status,
        cover_image_url,
        created_at
      )
    `)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Impossible de charger les produits : ${error.message}`);
  }

  return ((data as DashboardStoreProductsRow | null)?.products ?? [])
    .sort((left, right) => right.created_at.localeCompare(left.created_at));
};

const getDashboardSnapshot = async (): Promise<DashboardSnapshot> => {
  const [
    orders,
    orderItemsResult,
    products,
    notificationsResult,
    storeCreatedAt,
  ] = await Promise.all([
    getOrders(),

    supabase
      .from("order_items")
      .select(`
        id,
        order_id,
        store_id,
        product_id,
        product_name,
        unit_price,
        quantity,
        selected_variant,
        created_at
      `)
      .order("created_at", {
        ascending: false,
      }),

    getDashboardProducts(),

    supabase
      .from("notifications")
      .select(`
        id,
        title,
        message,
        type,
        is_read,
        metadata,
        created_at
      `)
      .order("created_at", {
        ascending: false,
      })
      .limit(30),

    getStoreCreatedAt(),
  ]);

  if (orderItemsResult.error) {
    throw new Error(
      `Impossible de charger les articles de commande : ${orderItemsResult.error.message}`
    );
  }

  /*
   * Les notifications peuvent échouer sans casser tout le dashboard.
   * Exemple : RLS ou problème temporaire.
   */
  if (notificationsResult.error) {
    console.warn(
      "Impossible de charger les notifications :",
      notificationsResult.error
    );
  }

  return {
    orders,
    orderItems: (orderItemsResult.data ?? []) as OrderItem[],
    products,
    notifications:
      (notificationsResult.data ??
        []) as DashboardNotificationRow[],
    storeCreatedAt,
  };
};

/* ============================================================================
   DASHBOARD STATS
============================================================================ */

export const getDashboardStats = async (
  period: DashboardPeriod = "30d"
): Promise<DashboardStats> => {
  const snapshot = await getDashboardSnapshot();

  const window = getPeriodWindow(
    period,
    new Date(),
    snapshot.storeCreatedAt
  );

  const currentOrders = filterOrders(
    snapshot.orders,
    window.currentStart,
    window.currentEnd
  );

  const previousOrders =
    window.previousStart && window.previousEnd
      ? filterOrders(
          snapshot.orders,
          window.previousStart,
          window.previousEnd
        )
      : [];

  const currentStats = calculatePeriodStats(
    currentOrders,
    snapshot.orderItems
  );

  const previousStats = calculatePeriodStats(
    previousOrders,
    snapshot.orderItems
  );

  /*
   * Produits = nombre réel de produits dans le catalogue.
   *
   * productsChange reste null volontairement :
   * on n'a pas de deleted_at, donc on ne peut pas reconstruire
   * avec certitude le nombre historique exact de produits.
   */
  const products = snapshot.products.length;

  return {
    totalEarnings: currentStats.earnings,
    totalOrders: currentStats.orders,
    products,
    totalSales: currentStats.sales,

    earningsChange: calculatePercentageChange(
      currentStats.earnings,
      previousStats.earnings,
      period !== "all" && window.comparable
    ),

    ordersChange: calculatePercentageChange(
      currentStats.orders,
      previousStats.orders,
      period !== "all" && window.comparable
    ),

    productsChange: null,

    salesChange: calculatePercentageChange(
      currentStats.sales,
      previousStats.sales,
      period !== "all" && window.comparable
    ),

    pendingOrders: currentStats.pendingOrders,

    averageOrder: currentStats.averageOrder,

    averageOrderChange: calculatePercentageChange(
      currentStats.averageOrder,
      previousStats.averageOrder,
      period !== "all" && window.comparable
    ),

    pendingChange: calculatePercentageChange(
      currentStats.pendingOrders,
      previousStats.pendingOrders,
      period !== "all" && window.comparable
    ),

    currency: getCurrency(
      currentOrders.length > 0
        ? currentOrders
        : snapshot.orders
    ),
  };
};

/* ============================================================================
   CHART
============================================================================ */

type ChartBucket = {
  start: Date;
  end: Date;
  label: string;
};

const createChartBuckets = (
  period: DashboardPeriod,
  now: Date,
  storeCreatedAt: string | null,
  orders: Order[]
): ChartBucket[] => {
  const buckets: ChartBucket[] = [];

  if (period === "today") {
    const start = startOfDay(now);

    for (let hour = 0; hour < 24; hour += 1) {
      const bucketStart = new Date(start);
      bucketStart.setHours(hour, 0, 0, 0);

      const bucketEnd = new Date(bucketStart);
      bucketEnd.setHours(hour + 1, 0, 0, 0);

      buckets.push({
        start: bucketStart,
        end: bucketEnd,
        label: `${String(hour).padStart(2, "0")}h`,
      });
    }

    return buckets;
  }

  if (period === "7d" || period === "30d") {
    const days = period === "7d" ? 7 : 30;

    const firstDay = startOfDay(
      addDays(now, -(days - 1))
    );

    for (let index = 0; index < days; index += 1) {
      const bucketStart = addDays(firstDay, index);
      const bucketEnd = addDays(bucketStart, 1);

      buckets.push({
        start: bucketStart,
        end: bucketEnd,
        label: bucketStart.toLocaleDateString(
          "fr-FR",
          {
            day: "2-digit",
            month: "2-digit",
          }
        ),
      });
    }

    return buckets;
  }

  if (period === "90d") {
    const firstWeek = startOfWeek(
      addDays(now, -89)
    );

    for (let index = 0; index < 14; index += 1) {
      const bucketStart = addDays(
        firstWeek,
        index * 7
      );

      const bucketEnd = addDays(bucketStart, 7);

      buckets.push({
        start: bucketStart,
        end: bucketEnd,
        label: bucketStart.toLocaleDateString(
          "fr-FR",
          {
            day: "2-digit",
            month: "short",
          }
        ),
      });
    }

    return buckets;
  }

  if (period === "1y") {
    const firstMonth = startOfMonth(
      addMonths(now, -11)
    );

    for (let index = 0; index < 12; index += 1) {
      const bucketStart = addMonths(
        firstMonth,
        index
      );

      const bucketEnd = addMonths(
        bucketStart,
        1
      );

      buckets.push({
        start: bucketStart,
        end: bucketEnd,
        label: bucketStart.toLocaleDateString(
          "fr-FR",
          {
            month: "short",
          }
        ),
      });
    }

    return buckets;
  }

  /* --------------------------------------------------------------------------
     ALL
  -------------------------------------------------------------------------- */

  const validDates = orders
    .map((order) => safeDate(order.created_at))
    .filter((date): date is Date => date !== null)
    .sort((a, b) => a.getTime() - b.getTime());

  const storeDate = safeDate(storeCreatedAt ?? "");

  const firstDate =
    storeDate ??
    validDates[0] ??
    startOfMonth(now);

  const totalDays = Math.max(
    1,
    Math.ceil(
      (now.getTime() - firstDate.getTime()) /
        MS_PER_DAY
    )
  );

  if (totalDays <= 60) {
    const firstDay = startOfDay(firstDate);

    for (
      let date = new Date(firstDay);
      date <= startOfDay(now);
      date = addDays(date, 1)
    ) {
      const end = addDays(date, 1);

      buckets.push({
        start: date,
        end,
        label: date.toLocaleDateString(
          "fr-FR",
          {
            day: "2-digit",
            month: "2-digit",
          }
        ),
      });
    }

    return buckets;
  }

  if (totalDays <= 180) {
    const firstWeek = startOfWeek(firstDate);

    for (
      let date = new Date(firstWeek);
      date <= startOfWeek(now);
      date = addDays(date, 7)
    ) {
      buckets.push({
        start: date,
        end: addDays(date, 7),
        label: date.toLocaleDateString(
          "fr-FR",
          {
            day: "2-digit",
            month: "short",
          }
        ),
      });
    }

    return buckets;
  }

  const firstMonth = startOfMonth(firstDate);

  for (
    let date = new Date(firstMonth);
    date <= startOfMonth(now);
    date = addMonths(date, 1)
  ) {
    buckets.push({
      start: date,
      end: addMonths(date, 1),
      label: date.toLocaleDateString(
        "fr-FR",
        {
          month: "short",
          year: "numeric",
        }
      ),
    });
  }

  return buckets;
};

export const getDashboardAnalytics = async (
  period: DashboardPeriod = "1y"
): Promise<DashboardAnalytics> => {
  const snapshot = await getDashboardSnapshot();

  const now = new Date();

  const buckets = createChartBuckets(
    period,
    now,
    snapshot.storeCreatedAt,
    snapshot.orders
  );

  const points: DashboardChartPoint[] =
    buckets.map((bucket) => {
      const bucketOrders = filterOrders(
        snapshot.orders,
        bucket.start,
        bucket.end
      ).filter(isRevenueOrder);

      const earnings = bucketOrders.reduce(
        (total, order) =>
          total + safeNumber(order.total_amount),
        0
      );

      return {
        label: bucket.label,
        earnings,
        orders: bucketOrders.length,
      };
    });

  const totalEarnings = points.reduce(
    (total, point) =>
      total + point.earnings,
    0
  );

  const totalOrders = points.reduce(
    (total, point) =>
      total + point.orders,
    0
  );

  return {
    period,
    points,
    totalEarnings,
    totalOrders,
    currency: getCurrency(snapshot.orders),
  };
};

/* ============================================================================
   TOP PRODUCTS
============================================================================ */

export const getTopSellingProducts = async (
  limit: number = 5
): Promise<DashboardTopProduct[]> => {
  const snapshot = await getDashboardSnapshot();

  const safeLimit = Math.max(
    1,
    Math.min(limit, 50)
  );

  const validOrders = snapshot.orders.filter(isRevenueOrder);

  const validItems = filterOrderItems(
    snapshot.orderItems,
    validOrders
  );

  const productsMap = new Map<
    string,
    {
      id: string;
      name: string;
      sales: number;
      earnings: number;
      currency: string;
    }
  >();

  for (const item of validItems) {
    const productKey =
      item.product_id ?? `item:${item.product_name}`;

    const quantity = safeNumber(item.quantity);
    const unitPrice = safeNumber(item.unit_price);

    const existing = productsMap.get(productKey);

    if (existing) {
      existing.sales += quantity;
      existing.earnings += quantity * unitPrice;
    } else {
      productsMap.set(productKey, {
        id: item.product_id ?? productKey,
        name: item.product_name,
        sales: quantity,
        earnings: quantity * unitPrice,
        currency: getCurrency(
          snapshot.orders,
          "XOF"
        ),
      });
    }
  }

  const sorted = Array.from(
    productsMap.values()
  ).sort((a, b) => {
    if (b.sales !== a.sales) {
      return b.sales - a.sales;
    }

    return b.earnings - a.earnings;
  });

  return sorted
    .slice(0, safeLimit)
    .map((item) => {
      const product = item.id.startsWith("item:")
        ? null
        : snapshot.products.find(
            (candidate) =>
              candidate.id === item.id
          );

      return {
        id: item.id,
        name: product?.name ?? item.name,
        price: product
          ? safeNumber(product.price)
          : 0,
        sales: item.sales,
        earnings: item.earnings,
        currency:
          product?.currency ??
          item.currency,
        status: product?.status ?? null,
        coverImageUrl:
          product?.cover_image_url ?? null,
      };
    });
};

/* ============================================================================
   ACTIVITÉS RÉCENTES
============================================================================ */

const buildOrderActivity = (
  order: Order
): DashboardActivity => {
  return {
    id: `order-${order.store_order_id}`,
    type: "order",
    title: `Commande #${order.order_number}`,
    description: `${order.customer_name} • ${safeNumber(
      order.total_amount
    ).toLocaleString("fr-FR")} ${order.currency}`,
    createdAt: order.created_at,
    metadata: {
      orderId: order.order_id,
      storeOrderId: order.store_order_id,
      storeId: order.store_id,
      orderNumber: order.order_number,
      status: order.order_status,
      paymentStatus: order.payment_status,
    },
  };
};

const buildNotificationActivity = (
  notification: DashboardNotificationRow
): DashboardActivity => {
  return {
    id: `notification-${notification.id}`,
    type:
      notification.type === "payment"
        ? "payment"
        : "notification",
    title: notification.title,
    description: notification.message,
    createdAt: notification.created_at,
    metadata: notification.metadata,
  };
};

export const getRecentActivities = async (
  limit: number = 8
): Promise<DashboardActivity[]> => {
  const snapshot = await getDashboardSnapshot();

  const safeLimit = Math.max(
    1,
    Math.min(limit, 50)
  );

  const orderActivities =
    snapshot.orders
      .slice(0, safeLimit)
      .map(buildOrderActivity);

  const notificationActivities =
    snapshot.notifications
      .slice(0, safeLimit)
      .map(buildNotificationActivity);

  return [
    ...orderActivities,
    ...notificationActivities,
  ]
    .sort((a, b) => {
      const dateA =
        safeDate(a.createdAt)?.getTime() ?? 0;

      const dateB =
        safeDate(b.createdAt)?.getTime() ?? 0;

      return dateB - dateA;
    })
    .slice(0, safeLimit);
};

/* ============================================================================
   DASHBOARD COMPLET
============================================================================ */

export const getDashboardData = async (
  period: DashboardPeriod = "30d"
): Promise<DashboardData> => {
  const snapshot = await getDashboardSnapshot();

  const now = new Date();

  const window = getPeriodWindow(
    period,
    now,
    snapshot.storeCreatedAt
  );

  const currentOrders = filterOrders(
    snapshot.orders,
    window.currentStart,
    window.currentEnd
  );

  const previousOrders =
    window.previousStart && window.previousEnd
      ? filterOrders(
          snapshot.orders,
          window.previousStart,
          window.previousEnd
        )
      : [];

  const currentStats = calculatePeriodStats(
    currentOrders,
    snapshot.orderItems
  );

  const previousStats = calculatePeriodStats(
    previousOrders,
    snapshot.orderItems
  );

  const stats: DashboardStats = {
    totalEarnings: currentStats.earnings,
    totalOrders: currentStats.orders,
    products: snapshot.products.length,
    totalSales: currentStats.sales,

    earningsChange: calculatePercentageChange(
      currentStats.earnings,
      previousStats.earnings,
      period !== "all" && window.comparable
    ),

    ordersChange: calculatePercentageChange(
      currentStats.orders,
      previousStats.orders,
      period !== "all" && window.comparable
    ),

    productsChange: null,

    salesChange: calculatePercentageChange(
      currentStats.sales,
      previousStats.sales,
      period !== "all" && window.comparable
    ),

    pendingOrders: currentStats.pendingOrders,
    averageOrder: currentStats.averageOrder,

    averageOrderChange: calculatePercentageChange(
      currentStats.averageOrder,
      previousStats.averageOrder,
      period !== "all" && window.comparable
    ),

    pendingChange: calculatePercentageChange(
      currentStats.pendingOrders,
      previousStats.pendingOrders,
      period !== "all" && window.comparable
    ),

    currency: getCurrency(
      currentOrders.length
        ? currentOrders
        : snapshot.orders
    ),
  };

  /* --------------------------------------------------------------------------
     Analytics
  -------------------------------------------------------------------------- */

  const buckets = createChartBuckets(
    period,
    now,
    snapshot.storeCreatedAt,
    snapshot.orders
  );

  const points = buckets.map(
    (bucket): DashboardChartPoint => {
      const bucketOrders = filterOrders(
        snapshot.orders,
        bucket.start,
        bucket.end
      ).filter(isRevenueOrder);

      return {
        label: bucket.label,
        earnings: bucketOrders.reduce(
          (total, order) =>
            total + safeNumber(order.total_amount),
          0
        ),
        orders: bucketOrders.length,
      };
    }
  );

  const analytics: DashboardAnalytics = {
    period,
    points,
    totalEarnings: points.reduce(
      (total, point) =>
        total + point.earnings,
      0
    ),
    totalOrders: points.reduce(
      (total, point) =>
        total + point.orders,
      0
    ),
    currency: stats.currency,
  };

  /* --------------------------------------------------------------------------
     Top products
  -------------------------------------------------------------------------- */

  const validOrders = snapshot.orders.filter(isRevenueOrder);

  const validItems = filterOrderItems(
    snapshot.orderItems,
    validOrders
  );

  const productsMap = new Map<
    string,
    {
      id: string;
      name: string;
      sales: number;
      earnings: number;
      currency: string;
    }
  >();

  for (const item of validItems) {
    const key =
      item.product_id ??
      `item:${item.product_name}`;

    const quantity = safeNumber(item.quantity);
    const unitPrice = safeNumber(item.unit_price);

    if (quantity <= 0) {
      continue;
    }

    const existing = productsMap.get(key);

    if (existing) {
      existing.sales += quantity;
      existing.earnings += quantity * unitPrice;
    } else {
      productsMap.set(key, {
        id: item.product_id ?? key,
        name: item.product_name,
        sales: quantity,
        earnings: quantity * unitPrice,
        currency: stats.currency,
      });
    }
  }

  let topProducts = Array.from(
    productsMap.values()
  )
    .sort((a, b) => {
      if (b.sales !== a.sales) {
        return b.sales - a.sales;
      }

      return b.earnings - a.earnings;
    })
    .slice(0, 2)
    .map((item): DashboardTopProduct => {
      const product =
        !item.id.startsWith("item:")
          ? snapshot.products.find(
              (candidate) =>
                candidate.id === item.id
            )
          : null;

      return {
        id: item.id,
        name: product?.name ?? item.name,
        price: product
          ? safeNumber(product.price)
          : 0,
        sales: item.sales,
        earnings: item.earnings,
        currency:
          product?.currency ??
          item.currency,
        status: product?.status ?? null,
        coverImageUrl:
          product?.cover_image_url ?? null,
      };
    });

  if (topProducts.length === 0) {
    topProducts = [...snapshot.products]
      .sort(
        (a, b) =>
          safeNumber(b.price) - safeNumber(a.price)
      )
      .slice(0, 2)
      .map((product): DashboardTopProduct => ({
        id: product.id,
        name: product.name,
        price: safeNumber(product.price),
        sales: 0,
        earnings: 0,
        currency: product.currency ?? stats.currency,
        status: product.status,
        coverImageUrl: product.cover_image_url,
      }));
  }

  /* --------------------------------------------------------------------------
     Activities
  -------------------------------------------------------------------------- */

  const orderActivities =
    snapshot.orders
      .slice(0, 10)
      .map(buildOrderActivity);

  const notificationActivities =
    snapshot.notifications
      .slice(0, 10)
      .map(buildNotificationActivity);

  const activities = [
    ...orderActivities,
    ...notificationActivities,
  ]
    .sort((a, b) => {
      const dateA =
        safeDate(a.createdAt)?.getTime() ?? 0;

      const dateB =
        safeDate(b.createdAt)?.getTime() ?? 0;

      return dateB - dateA;
    })
    .slice(0, 8);

  return {
    stats,
    analytics,
    topProducts,
    activities,
    storeCreatedAt: snapshot.storeCreatedAt,
    availablePeriods:
      getAvailableDashboardPeriods(
        snapshot.storeCreatedAt
      ),
  };
};

/* ============================================================================
   REALTIME
============================================================================ */

let dashboardChannelSequence = 0;

export const subscribeToDashboard = (
  onChange: () => void
): (() => void) => {
  const channelTopic =
    `nexa-dashboard-${Date.now()}-${dashboardChannelSequence++}`;

  const channel = supabase
    .channel(channelTopic)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
      },
      () => {
        onChange();
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "order_items",
      },
      () => {
        onChange();
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "products",
      },
      () => {
        onChange();
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
      },
      () => {
        onChange();
      }
    )
    .subscribe((status) => {
      if (status === "CHANNEL_ERROR") {
        console.error(
          "Erreur Realtime du dashboard."
        );
      }
    });

  return () => {
    void supabase.removeChannel(channel);
  };
};