import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import type { DashboardTopProduct } from "@/services/dashboard.service";

type DocPerformanceProps = {
  products: DashboardTopProduct[];
};

const columns = [
  "Products",
  "Price",
  "Sales",
  "Earnings",
  "Status",
];

const formatCurrency = (value: number) =>
  `${value.toLocaleString("fr-FR")} XOF`;

const DOCPERFORMANCE = ({ products }: DocPerformanceProps) => {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">

          <div className="rounded-full border border-gray-200 bg-white p-1">
            <FileText
              size={15}
              strokeWidth={1.8}
              className="text-gray-500"
            />
          </div>

          <h2 className="text-[14px]! font-semibold text-gray-900">
       Top Selling Products
          </h2>

        </div>

        <Link
          type="button"
          to="/dashboard/marketplace"
          className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-900 transition hover:bg-gray-50"
        >
          See All
        </Link>

      </div>

      {/* Table */}

      <div className="mt-4 overflow-hidden">

        {/* Table Header */}

        <div className="grid grid-cols-[1.8fr_0.8fr_0.7fr_0.9fr_0.7fr] rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">

          {columns.map((column) => (
            <span
              key={column}
              className="text-[10px] font-semibold uppercase tracking-wide text-gray-900"
            >
              {column}
            </span>
          ))}

        </div>

        {/* Loading */}

        {/* Empty */}

        {products.length === 0 && (
          <div className="py-8 text-center text-[11px] text-gray-400">
            No products found.
          </div>
        )}

        {/* Rows */}

        {products.map((product) => (
            <div
              key={product.id}
              title="see details"
              className="grid grid-cols-[1.8fr_0.8fr_0.7fr_0.9fr_0.7fr] cursor-pointer items-center border-b border-gray-100 px-3 py-2.5"
            >

              {/* Product */}

              <div    className="  flex min-w-0 items-center gap-2" >

                <div 
               
                className="h-7 w-7 shrink-0 overflow-hidden rounded-md bg-gray-100">

                  {product.coverImageUrl ? (
                    <img
                      src={product.coverImageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <FileText
                        size={13}
                        className="text-gray-400"
                      />
                    </div>
                  )}

                </div>

                <span className="truncate text-[11px] font-medium text-gray-700">
                  {product.name}
                </span>

              </div>

              {/* Price */}

              <span className="text-[11px] text-gray-700">
                {formatCurrency(product.price)}
              </span>

              {/* Downloads */}

              <span className="text-[11px] text-gray-700">
                {product.sales}
              </span>

              {/* Earnings */}

              <span className="text-[11px] text-gray-700">
                {formatCurrency(product.earnings)}
              </span>

              {/* Status */}

              <span
                className={`w-fit rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                  product.status?.toLowerCase() === "published"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-600"
                }`}
              >
                {product.status
                  ? product.status.charAt(0).toUpperCase() + product.status.slice(1)
                  : "Draft"}
              </span>

            </div>
          ))}

      </div>

    </section>
  );
};

export default DOCPERFORMANCE;