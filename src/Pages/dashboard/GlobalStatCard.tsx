import StatCard from "./StatCard";
import type { DashboardStats } from "@/services/dashboard.service";

type GlobalStatCardProps = {
  stats: DashboardStats | null;
  period?: string;
};

const GlobalStatCard = ({ stats, period }: GlobalStatCardProps) => {
  if (!stats) {
    return null;
  }

  const metrics = [
    {
      id: "earnings",
      label: "Total Earnings",
      value: stats.totalEarnings,
      change: stats.earningsChange,
      currency: stats.currency,
      period,
    },
    {
      id: "orders",
      label: "Total Orders",
      value: stats.totalOrders,
      change: stats.ordersChange,
      currency: "",
      period,
    },
    {
      id: "products",
      label: "Products",
      value: stats.products,
      change: stats.productsChange,
      currency: "",
      period,
    },
    {
      id: "sales",
      label: "Total Sales",
      value: stats.totalSales,
      change: stats.salesChange,
      period,
    },
  ];

  return (
    <div
      className="
        mt-4
        grid
        min-w-0
        grid-cols-2
        gap-3
        sm:grid-cols-2
        xl:grid-cols-4
      "
    >
      {metrics.map((metric) => (
        <StatCard
          key={metric.id}
          title={metric.label}
          value={metric.value}
          change={metric.change}
          currency={metric.currency || undefined}
          period={metric.period}
        />
      ))}
    </div>
  );
};

export default GlobalStatCard;