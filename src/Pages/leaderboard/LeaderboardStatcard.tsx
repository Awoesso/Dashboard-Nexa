import React, { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Clock3,
  ShoppingBag,
  Wallet,
} from "lucide-react";

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface Order {
  total_amount: number;
  order_status: string;
  created_at: string;
}

export interface LeaderboardStatcardProps {
  orders?: Order[];
  storeCreatedAt?: string;
}

type PeriodKey =
  | "today"
  | "7d"
  | "30d"
  | "3m"
  | "6m"
  | "1y"
  | "all";

interface PeriodOption {
  key: PeriodKey;
  label: string;
  days: number | null;
}

interface PeriodStats {
  orders: number;
  revenue: number;
  pendingOrders: number;
  averageOrder: number;
}

interface StatCard {
  id: number;
  title: string;
  value: string;
  currency?: string;
  change?: number;
  icon: React.ReactNode;
}

// ==========================================
// CONSTANTES & UTILS
// ==========================================

const PERIODS: PeriodOption[] = [
  { key: "today", label: "Aujourd’hui", days: 1 },
  { key: "7d", label: "7 derniers jours", days: 7 },
  { key: "30d", label: "30 derniers jours", days: 30 },
  { key: "3m", label: "3 derniers mois", days: 90 },
  { key: "6m", label: "6 derniers mois", days: 180 },
  { key: "1y", label: "1 an", days: 365 },
  { key: "all", label: "Depuis le début", days: null },
];

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("fr-FR").format(Math.round(value));
};

const getDaysSince = (date?: string) => {
  if (!date) return 0;
  const created = new Date(date);
  if (isNaN(created.getTime())) return 0;
  const now = new Date();
  const difference = now.getTime() - created.getTime();
  return Math.max(0, Math.floor(difference / (1000 * 60 * 60 * 24)));
};

const getDateDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const isPendingOrder = (status: string) => {
  return ["pending", "processing"].includes((status || "").toLowerCase());
};

const getPercentageChange = (
  current: number,
  previous: number
): number | undefined => {
  if (previous === 0) {
    if (current === 0) return 0;
    return undefined;
  }
  return ((current - previous) / previous) * 100;
};

// ==========================================
// SOUS-COMPOSANTS
// ==========================================

// 1. En-tête du composant
const OverviewHeader: React.FC = () => (
  <div className="flex min-w-0 items-center gap-2">
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white">
      <span className="text-[11px]">✦</span>
    </div>
    <div className="min-w-0">
   
      <p className="mt-0.5 truncate text-[9px] font-semibold text-gray-700 sm:text-[10px]">
        Performances de votre boutique
      </p>
    </div>
  </div>
);

// 2. Sélecteur de Période (Dropdown)
interface PeriodSelectorProps {
  currentPeriodLabel: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  availablePeriods: PeriodOption[];
  effectivePeriodKey: PeriodKey;
  onSelectPeriod: (key: PeriodKey) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  currentPeriodLabel,
  isOpen,
  setIsOpen,
  availablePeriods,
  effectivePeriodKey,
  onSelectPeriod,
}) => (
  <div className="relative">
    <button
      type="button"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      onClick={() => setIsOpen((value) => !value)}
      className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-gray-900 transition hover:border-gray-300 hover:bg-gray-50 sm:px-3 sm:text-xs"
    >
      {currentPeriodLabel}
      <ChevronDown
        size={13}
        className={`shrink-0 transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>

    {isOpen && (
      <>
        <button
          type="button"
          aria-label="Fermer le sélecteur"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 cursor-default"
        />

        <div
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-lg"
        >
          {availablePeriods.map((period) => {
            const active = period.key === effectivePeriodKey;

            return (
              <button
                key={period.key}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onSelectPeriod(period.key);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[11px] transition ${
                  active
                    ? "bg-gray-100 font-semibold text-gray-900"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{period.label}</span>
                {active && (
                  <Check size={13} className="text-gray-900" />
                )}
              </button>
            );
          })}
        </div>
      </>
    )}
  </div>
);

// 3. Message sur l'âge de la boutique
const StoreAgeMessage: React.FC<{ storeAgeInDays: number }> = ({
  storeAgeInDays,
}) => {
  if (storeAgeInDays >= 30) return null;

  return (
    <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-[10px] leading-relaxed text-gray-500">
      Votre boutique a actuellement{" "}
      <span className="font-semibold text-gray-800">
        {storeAgeInDays} jour{storeAgeInDays > 1 ? "s" : ""}
      </span>
      . Les périodes disponibles sont adaptées à son ancienneté.
    </div>
  );
};

// 4. Carte Statistique Individuelle
const StatCardItem: React.FC<{ card: StatCard }> = ({ card }) => {
  const hasChange =
    card.change !== undefined && Number.isFinite(card.change);
  const isPositive = card.change !== undefined && card.change >= 0;

  return (
    <div className="flex min-w-0 flex-col justify-between rounded-xl border border-gray-200 bg-white px-3.5 py-3 transition-all duration-200 hover:-translate-y-px hover:border-gray-300 hover:shadow-sm">
      <div className="flex items-center gap-1.5">
        <span className="text-gray-400">{card.icon}</span>
        <p className="min-w-0 truncate text-xs font-semibold text-gray-700">
          {card.title}
        </p>
      </div>

      <div className="mt-3 flex min-w-0 items-end justify-between gap-2">
        <p className="min-w-0 truncate font-mono text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
          {card.currency && (
            <span className="mr-1 font-sans text-[10px] font-medium text-gray-500">
              {card.currency}
            </span>
          )}
          {card.value}
        </p>

        {hasChange && (
          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
              isPositive
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {isPositive ? "+" : ""}
            {card.change!.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
};

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================

const LeaderboardStatcard: React.FC<LeaderboardStatcardProps> = ({
  orders = [],
  storeCreatedAt = "",
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("30d");
  const [isOpen, setIsOpen] = useState(false);

  const storeAgeInDays = useMemo(() => {
    return getDaysSince(storeCreatedAt);
  }, [storeCreatedAt]);

  const availablePeriods = useMemo(() => {
    return PERIODS.filter((period) => {
      if (period.key === "all" || period.days === null) {
        return true;
      }
      return storeAgeInDays >= period.days;
    });
  }, [storeAgeInDays]);

  const effectivePeriodKey = useMemo<PeriodKey>(() => {
    const selectedIsAvailable = availablePeriods.some(
      (period) => period.key === selectedPeriod
    );

    if (selectedIsAvailable) {
      return selectedPeriod;
    }

    return (
      availablePeriods[availablePeriods.length - 1]?.key ?? "all"
    );
  }, [availablePeriods, selectedPeriod]);

  const currentPeriod = useMemo(() => {
    return (
      availablePeriods.find(
        (period) => period.key === effectivePeriodKey
      ) ?? PERIODS.find((period) => period.key === "all")!
    );
  }, [availablePeriods, effectivePeriodKey]);

  const currentOrders = useMemo(() => {
    const safeOrders = orders || [];
    if (currentPeriod.days === null) {
      if (!storeCreatedAt) return safeOrders;
      const storeCreationDate = new Date(storeCreatedAt);
      return safeOrders.filter((order) => {
        const orderDate = new Date(order.created_at);
        return orderDate >= storeCreationDate;
      });
    }

    const startDate = getDateDaysAgo(currentPeriod.days);
    return safeOrders.filter((order) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= startDate;
    });
  }, [orders, currentPeriod, storeCreatedAt]);

  const previousOrders = useMemo(() => {
    const safeOrders = orders || [];
    if (currentPeriod.days === null) {
      return [];
    }

    const endDate = getDateDaysAgo(currentPeriod.days);
    const startDate = getDateDaysAgo(currentPeriod.days * 2);

    return safeOrders.filter((order) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= startDate && orderDate < endDate;
    });
  }, [orders, currentPeriod]);

  const currentStats = useMemo<PeriodStats>(() => {
    const revenue = currentOrders.reduce(
      (total, order) => total + Number(order.total_amount || 0),
      0
    );

    const pendingOrders = currentOrders.filter((order) =>
      isPendingOrder(order.order_status)
    ).length;

    const averageOrder =
      currentOrders.length > 0
        ? revenue / currentOrders.length
        : 0;

    return {
      orders: currentOrders.length,
      revenue,
      pendingOrders,
      averageOrder,
    };
  }, [currentOrders]);

  const previousStats = useMemo<PeriodStats>(() => {
    const revenue = previousOrders.reduce(
      (total, order) => total + Number(order.total_amount || 0),
      0
    );

    const pendingOrders = previousOrders.filter((order) =>
      isPendingOrder(order.order_status)
    ).length;

    const averageOrder =
      previousOrders.length > 0
        ? revenue / previousOrders.length
        : 0;

    return {
      orders: previousOrders.length,
      revenue,
      pendingOrders,
      averageOrder,
    };
  }, [previousOrders]);

  const ordersChange = getPercentageChange(
    currentStats.orders,
    previousStats.orders
  );

  const revenueChange = getPercentageChange(
    currentStats.revenue,
    previousStats.revenue
  );

  const pendingOrdersChange = getPercentageChange(
    currentStats.pendingOrders,
    previousStats.pendingOrders
  );

  const averageOrderChange = getPercentageChange(
    currentStats.averageOrder,
    previousStats.averageOrder
  );

  const stats: StatCard[] = [
    {
      id: 1,
      title: "Commandes",
      value: formatNumber(currentStats.orders),
      change: ordersChange,
      icon: <ShoppingBag size={15} />,
    },
    {
      id: 2,
      title: "Chiffre d'affaires",
      value: formatNumber(currentStats.revenue),
      currency: "XOF",
      change: revenueChange,
      icon: <Wallet size={15} />,
    },
    {
      id: 3,
      title: "Commandes en attente",
      value: formatNumber(currentStats.pendingOrders),
      change: pendingOrdersChange,
      icon: <Clock3 size={15} />,
    },
    {
      id: 4,
      title: "Panier moyen",
      value: formatNumber(currentStats.averageOrder),
      currency: "XOF",
      change: averageOrderChange,
      icon: <Check size={15} />,
    },
  ];

  return (
    <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3">
        <OverviewHeader />
        <PeriodSelector
          currentPeriodLabel={currentPeriod.label}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          availablePeriods={availablePeriods}
          effectivePeriodKey={effectivePeriodKey}
          onSelectPeriod={setSelectedPeriod}
        />
      </div>

      {/* STORE AGE MESSAGE */}
      <StoreAgeMessage storeAgeInDays={storeAgeInDays} />

      {/* STAT CARDS */}
      <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((card) => (
          <StatCardItem key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
};

export default LeaderboardStatcard;