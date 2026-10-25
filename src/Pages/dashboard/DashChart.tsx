import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getDashboardAnalytics } from "@/services/dashboard.service";

import type {
  DashboardAnalytics,
  DashboardPeriod,
  DashboardPeriodOption,
} from "@/services/dashboard.service";

interface DashChartProps {
  analytics: DashboardAnalytics | null;
  periodOptions: DashboardPeriodOption[];
  refreshKey: number;
}

type TooltipProps = {
  active?: boolean;
  currency: string;
  payload?: {
    payload: {
      label: string;
      earnings: number;
      orders: number;
    };
  }[];
};

const CustomTooltip = ({
  active,
  payload,
  currency,
}: TooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div
      className="
        min-w-[145px]
        rounded-xl
        border border-gray-200
        bg-white
        px-3 py-2.5
        shadow-lg
      "
    >
      {/* Label */}

      <p className="mb-2 font-heading text-[10px]! font-semibold text-gray-900">
        {data.label}
      </p>

      {/* Metrics */}

      <div className="space-y-1.5">

        {/* Earnings */}

        <div className="flex items-center justify-between gap-4">
          <span className="text-[9px]! font-normal text-gray-500">
            Revenus
          </span>

          <span className="font-mono text-[9px]! font-medium text-gray-900">
            {data.earnings.toLocaleString("fr-FR")} {currency}
          </span>
        </div>

        {/* Orders */}

        <div className="flex items-center justify-between gap-4">
          <span className="text-[9px]! font-normal text-gray-500">
            Commandes
          </span>

          <span className="font-mono text-[9px]! font-medium text-gray-900">
            {data.orders.toLocaleString("fr-FR")}
          </span>
        </div>

      </div>
    </div>
  );
};

const DashChart = ({
  analytics,
  periodOptions,
  refreshKey,
}: DashChartProps) => {
  const initialPeriod = analytics?.period ?? "30d";
  const [selectedPeriod, setSelectedPeriod] =
    useState<DashboardPeriod>(initialPeriod);
  const [chartState, setChartState] = useState<{
    period: DashboardPeriod;
    data: DashboardAnalytics | null;
    error: string | null;
  }>({ period: initialPeriod, data: analytics, error: null });
  const [retryVersion, setRetryVersion] = useState(0);
  const requestIdRef = useRef(0);
  const lastLoadedRef = useRef({
    period: analytics?.period ?? null,
    refreshKey: 0,
  });

  const period = useMemo(() => {
    if (periodOptions.some((option) => option.key === selectedPeriod)) {
      return selectedPeriod;
    }

    return (
      [...periodOptions].reverse().find((option) => option.days !== null)?.key ??
      "all"
    );
  }, [periodOptions, selectedPeriod]);
  const chartLoading = chartState.period !== period && chartState.error === null;
  const chartData = chartState.data?.points ?? [];

  useEffect(() => {
    if (
      lastLoadedRef.current.period === period &&
      lastLoadedRef.current.refreshKey === refreshKey
    ) {
      return;
    }

    const requestId = ++requestIdRef.current;
    void getDashboardAnalytics(period)
      .then((result) => {
        if (requestId !== requestIdRef.current) return;
        lastLoadedRef.current = { period, refreshKey };
        setChartState({ period, data: result, error: null });
      })
      .catch((loadError: unknown) => {
        if (requestId !== requestIdRef.current) return;
        setChartState((current) => ({
          ...current,
          error:
            loadError instanceof Error
              ? loadError.message
              : "Impossible de charger le graphique.",
        }));
      });

    return () => {
      requestIdRef.current += 1;
    };
  }, [period, refreshKey, retryVersion]);

  const chartCurrency = chartState.data?.currency ?? analytics?.currency ?? "XOF";

  return (
    <section
      className="
        w-full
        min-w-0
        overflow-hidden
        rounded-2xl
        border border-gray-200
        bg-white
        p-3.5
        sm:p-4
      "
    >

      {/* ================= HEADER ================= */}

      <div
        className="
          flex
          min-w-0
          flex-col
          gap-3
          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >

        {/* Title */}

        <div className="min-w-0">

          <h2 className="app-section-title truncate text-gray-900">
            Analytics & Performances
          </h2>

          <p className="app-section-description mt-0.5 text-gray-500">
            Understand your earnings and orders
          </p>

        </div>

        {/* Period */}

        <label
          className="
            w-fit shrink-0
          "
        >
          <span className="sr-only">Période du graphique</span>
          <select
            aria-label="Période du graphique"
            value={period}
            onChange={(event) => {
              setChartState((current) => ({ ...current, error: null }));
              setSelectedPeriod(event.target.value as DashboardPeriod);
            }}
            className="w-full rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs! font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {periodOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

      </div>

      {/* ================= LEGEND ================= */}

      <div className="mt-4 flex items-center gap-4 sm:gap-5">

        <div className="flex items-center gap-2">

          <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />

          <span className="text-[10px]! font-medium text-gray-600">
            Revenus
          </span>

        </div>

      </div>

      {/* ================= CHART ================= */}

      <div
        className="
          mt-3
          h-[210px]
          w-full
          min-w-0
          sm:mt-4
          sm:h-[240px]
        "
      >

        {chartState.error ? (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <p role="alert" className="text-center text-[11px]! font-medium text-red-600">
              {chartState.error}
            </p>
            <button
              type="button"
              onClick={() => setRetryVersion((version) => version + 1)}
              className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Réessayer
            </button>
          </div>
        ) : chartData.length === 0 && !chartLoading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-[11px]! font-medium text-gray-400">
              Aucune donnée disponible
            </p>
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 5,
                left: -18,
                bottom: 0,
              }}
              barCategoryGap="12%"
            >

              {/* ================= GRADIENT ================= */}

              <defs>

                <linearGradient
                  id="earningsGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >

                  <stop
                    offset="0%"
                    stopColor="#3b82f6"
                  />

                  <stop
                    offset="55%"
                    stopColor="#2563eb"
                  />

                  <stop
                    offset="100%"
                    stopColor="#172554"
                  />

                </linearGradient>

              </defs>

              {/* ================= GRID ================= */}

              <CartesianGrid
                vertical={false}
                stroke="#e5e7eb"
                strokeDasharray="3 3"
              />

              {/* ================= X AXIS ================= */}

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 9,
                  fill: "#6b7280",
                }}
                dy={7}
                interval="preserveStartEnd"
              />

              {/* ================= Y AXIS ================= */}

              <YAxis
                axisLine={false}
                tickLine={false}
                width={35}
                tick={{
                  fontSize: 8,
                  fill: "#9ca3af",
                }}
                tickFormatter={(value: number) =>
                  value >= 1000
                    ? `${value / 1000}k`
                    : `${value}`
                }
              />

              {/* ================= TOOLTIP ================= */}

              <Tooltip
                cursor={{
                  fill: "rgba(37, 99, 235, 0.04)",
                }}
                content={<CustomTooltip currency={chartCurrency} />}
              />

              {/* ================= BAR ================= */}

              <Bar
                dataKey="earnings"
                fill="url(#earningsGradient)"
                radius={[6, 6, 2, 2]}
                maxBarSize={52}
                animationBegin={100}
                animationDuration={800}
                animationEasing="ease-out"
                activeBar={false}
                className="outline-none"
              />

            </BarChart>
          </ResponsiveContainer>
        )}
        {chartLoading && (
          <p role="status" className="mt-1 text-center text-[10px] text-gray-500">
            Mise à jour du graphique…
          </p>
        )}

      </div>

    </section>
  );
};

export default DashChart;