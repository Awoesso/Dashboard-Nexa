import type { DashboardConfig } from "../dashboard.types";
import type { DocumentItem } from "./documentsData";
import { documentsData } from "./documentsData";
import { chartData, type ChartDataItem } from "./chartData";

export const dashboardConfig: DashboardConfig<
  DocumentItem,
  ChartDataItem
> = {
  brandName: "Orion",

  currency: "XOF",

  metrics: [
    {
      id: "earnings",
      label: "Total Earnings",
      value: 138450,
      currency: "XOF",
      change: 23,
    period:""
    },
    {
      id: "downloads",
      label: "Commandes totales",
      value: 284,
      change: 18,
    period:""
    },
    {
      id: "products",
      label: "Produits",
      value: 12,
      change: 9,
    period:""
    },
    {
      id: "sales",
      label: "Total Sales",
      value: 97,
      change: 14,
    period:""
    },
  ],

  tableData: documentsData,

  chartData,
};