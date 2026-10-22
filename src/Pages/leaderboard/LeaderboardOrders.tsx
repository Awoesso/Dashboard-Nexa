import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Package,
  Search,
  AlertCircle,
} from "lucide-react";

export interface LeaderboardOrder {
  store_order_id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  city: string;
  total_amount: number;
  currency: string;
  payment_status: string;
  order_status: string;
  created_at: string;
}

interface LeaderboardOrdersProps {
  orders?: LeaderboardOrder[];
  loading?: boolean;
  error?: string | null;
  onOrderClick?: (storeOrderId: string) => void;
}

type StatusFilter =
  | "all"
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  processing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  processing: "bg-violet-50 text-violet-700",
  shipped: "bg-indigo-50 text-indigo-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-rose-50 text-rose-700",
};

const ITEMS_PER_PAGE = 6;

const formatAmount = (amount: number, currency: string) => {
  return `${new Intl.NumberFormat("fr-FR").format(amount)} ${currency}`;
};

const formatDate = (date: string) => {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "Date inconnue";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
};

const LeaderboardOrders: React.FC<LeaderboardOrdersProps> = ({
  orders = [],
  loading = false,
  error = null,
  onOrderClick,
}) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrage des commandes
  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.order_number.toLowerCase().includes(query) ||
        order.customer_name.toLowerCase().includes(query) ||
        order.customer_phone.toLowerCase().includes(query);

      const matchesStatus =
        status === "all" || order.order_status === status;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, status]);

  // Recalcul des pages
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));

  // Réinitialisation de la page si recherche ou filtre
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (newStatus: StatusFilter) => {
    setStatus(newStatus);
    setFilterOpen(false);
    setCurrentPage(1);
  };

  // Découpage pour la pagination
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  return (
    <section className="mt-4 min-w-0 rounded-2xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="mt-1 text-xs font-semibold text-gray-700!">
              Consultez et gérez les commandes de votre boutique.
            </p>
          </div>

          <span className="shrink-0 text-xs text-gray-400">
            {filteredOrders.length} commande{filteredOrders.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Search + filter */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Rechercher une commande ou un client..."
              className="
                h-9
                w-full
                rounded-full
                border border-gray-200
                bg-gray-50
                pl-9 pr-3
                text-xs
                text-gray-900
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-gray-300
                focus:bg-white
              "
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((value) => !value)}
              className="
                flex
                h-9
                w-full
                items-center
                justify-between
                gap-2
                rounded-lg
                border border-gray-200
                bg-white
                px-3
                text-xs
                font-medium
                text-gray-700
                transition
                hover:bg-gray-50
                sm:w-auto
              "
            >
              <span>
                {status === "all"
                  ? "Tous les statuts"
                  : STATUS_LABELS[status]}
              </span>

              <ChevronDown
                size={14}
                className={`transition-transform ${
                  filterOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {filterOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-11
                  z-20
                  min-w-42.5
                  rounded-xl
                  border border-gray-200
                  bg-white
                  p-1
                  shadow-lg
                "
              >
                <button
                  type="button"
                  onClick={() => handleStatusChange("all")}
                  className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-gray-50"
                >
                  Tous les statuts
                </button>

                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleStatusChange(value as StatusFilter)}
                    className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-gray-50"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0">
        {loading ? (
          <div className="space-y-2 p-3 sm:p-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-17 animate-pulse rounded-xl bg-gray-50"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex min-h-55 flex-col items-center justify-center px-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50">
              <AlertCircle size={18} className="text-rose-500" />
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-900">
              Erreur de chargement
            </p>
            <p className="mt-1 max-w-sm text-xs text-gray-500">{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex min-h-55 flex-col items-center justify-center px-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50">
              <Package size={18} className="text-gray-400" />
            </div>

            <p className="mt-3 text-sm font-semibold text-gray-900">
              Aucune commande
            </p>

            <p className="mt-1 max-w-sm text-xs text-gray-500">
              {search
                ? "Aucune commande ne correspond à votre recherche."
                : "Les nouvelles commandes apparaîtront ici."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop header */}
            <div
              className="
                hidden
                grid-cols-[1.2fr_1.5fr_1fr_1fr_32px]
                gap-4
                border-b border-gray-100
                px-4 py-2.5
                text-[10px]
                font-semibold
                uppercase
                tracking-wide
                text-gray-800
                md:grid
              "
            >
              <span>Commande</span>
              <span>Client</span>
              <span>Montant</span>
              <span>Statut</span>
              <span />
            </div>

            <div className="divide-y divide-gray-100">
              {paginatedOrders.map((order) => (
                <button
                  key={order.store_order_id}
                  type="button"
                  onClick={() => onOrderClick?.(order.store_order_id)}
                  className="
                    group
                    w-full
                    text-left
                    transition
                    hover:bg-gray-50
                    focus:outline-none
                    focus:bg-gray-50
                  "
                >
                  <div
                    className="
                      grid
                      grid-cols-1
                      gap-3
                      px-3 py-3.5
                      sm:px-4
                      md:grid-cols-[1.2fr_1.5fr_1fr_1fr_32px]
                      md:items-center
                      md:gap-4
                    "
                  >
                    {/* Order */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-semibold text-gray-900">
                          #{order.order_number}
                        </span>

                        <span className="flex items-center gap-1 text-[10px] text-gray-400 md:hidden">
                          <Clock3 size={11} />
                          {formatDate(order.created_at)}
                        </span>
                      </div>

                      <p className="mt-1 text-[10px] text-gray-400 md:text-xs">
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    {/* Customer */}
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-gray-900">
                        {order.customer_name}
                      </p>

                      <p className="mt-1 truncate text-[10px] text-gray-400">
                        {order.customer_phone} · {order.city}
                      </p>
                    </div>

                    {/* Amount */}
                    <div>
                      <p className="text-xs font-semibold text-gray-900">
                        {formatAmount(
                          order.total_amount,
                          order.currency
                        )}
                      </p>

                      <p className="mt-1 text-[10px] text-gray-400">
                        Paiement :{" "}
                        {order.payment_status === "paid"
                          ? "Payé"
                          : "En attente"}
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <span
                        className={`
                          inline-flex
                          rounded-full
                          px-2 py-1
                          text-[10px]
                          font-medium
                          ${
                            STATUS_STYLES[order.order_status] ??
                            "bg-gray-50 text-gray-600"
                          }
                        `}
                      >
                        {STATUS_LABELS[order.order_status] ??
                          order.order_status}
                      </span>
                    </div>

                    {/* Arrow */}
                    <div className="hidden justify-end md:flex">
                      <ChevronRight
                        size={16}
                        className="
                          text-gray-300
                          transition-transform
                          group-hover:translate-x-0.5
                          group-hover:text-gray-500
                        "
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col gap-3 border-t border-gray-100 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                <span className="text-xs text-gray-500">
                  Page <span className="font-medium text-gray-900">{currentPage}</span> sur{" "}
                  <span className="font-medium text-gray-900">{totalPages}</span>
                </span>

                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="
                      flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent
                    "
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`
                        h-8 min-w-8 rounded-lg px-2.5 text-xs font-medium transition
                        ${
                          currentPage === page
                            ? "bg-gray-900 text-white"
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }
                      `}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className="
                      flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent
                    "
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default LeaderboardOrders;