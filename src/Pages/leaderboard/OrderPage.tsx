import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock3,
  CreditCard,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  ShoppingBag,
  User,
} from "lucide-react";

import {
  getOrderByStoreOrderId,
  getOrderItems,
  updateOrderStatus,
  type Order,
  type OrderItem,
  type OrderStatus,
} from "@/services/orders.service";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const formatAmount = (
  amount: number | string,
  currency = "XOF"
): string => {
  const value = Number(amount);

  if (Number.isNaN(value)) {
    return `0 ${currency}`;
  }

  return `${new Intl.NumberFormat("fr-FR").format(value)} ${currency}`;
};

const formatDate = (date: string): string => {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "Date inconnue";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  processing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const PAYMENT_LABELS: Record<string, string> = {
  pending: "En attente",
  paid: "Payé",
  failed: "Échec",
  refunded: "Remboursé",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-violet-50 text-violet-700 border-violet-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

const PAYMENT_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
  refunded: "bg-violet-50 text-violet-700 border-violet-200",
};

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

const OrderPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#fafafa] px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="skeleton h-9 w-9 rounded-full" />

            <div>
              <div className="skeleton h-4 w-32" />
              <div className="skeleton mt-2 h-3 w-24" />
            </div>
          </div>

          <div className="skeleton h-8 w-24 rounded-full" />
        </div>

        {/* Summary */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-gray-200 bg-white p-4"
            >
              <div className="skeleton h-3 w-24" />
              <div className="skeleton mt-3 h-6 w-32" />
              <div className="skeleton mt-2 h-3 w-20" />
            </div>
          ))}
        </div>

        {/* Main */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <div className="skeleton h-4 w-40" />

            <div className="mt-5 space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 border-b border-gray-100 pb-4"
                >
                  <div className="skeleton h-12 w-12 rounded-xl" />

                  <div className="flex-1">
                    <div className="skeleton h-3 w-32" />
                    <div className="skeleton mt-2 h-3 w-20" />
                  </div>

                  <div className="skeleton h-4 w-20" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
              <div className="skeleton h-4 w-28" />

              <div className="mt-5 space-y-4">
                <div className="skeleton h-4 w-40" />
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-4 w-48" />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
              <div className="skeleton h-4 w-32" />
              <div className="skeleton mt-4 h-10 w-full rounded-xl" />
              <div className="skeleton mt-3 h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

const OrderPage = () => {
  const navigate = useNavigate();
  const { storeOrderId } = useParams<{ storeOrderId: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [updatingOrder, setUpdatingOrder] = useState(false);

  const [showOrderStatus, setShowOrderStatus] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* Chargement                                                               */
  /* ------------------------------------------------------------------------ */

  const loadOrder = useCallback(async () => {
    if (!storeOrderId) {
      setError("Commande introuvable.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const orderData = await getOrderByStoreOrderId(storeOrderId);

      if (!orderData) {
        setError("Cette commande n'existe pas.");
        setOrder(null);
        setItems([]);
        return;
      }

      const itemsData = await getOrderItems(
        orderData.order_id,
        orderData.store_id
      );

      setOrder(orderData);
      setItems(itemsData);
    } catch (err) {
      console.error("Erreur chargement commande :", err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger la commande."
      );
    } finally {
      setLoading(false);
    }
  }, [storeOrderId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadOrder();
    });
  }, [loadOrder]);

  /* ------------------------------------------------------------------------ */
  /* Totaux                                                                   */
  /* ------------------------------------------------------------------------ */

  const itemsTotal = useMemo(() => {
    return items.reduce((total, item) => {
      return total + Number(item.unit_price) * item.quantity;
    }, 0);
  }, [items]);

  const totalQuantity = useMemo(() => {
    return items.reduce((total, item) => {
      return total + item.quantity;
    }, 0);
  }, [items]);

  /* ------------------------------------------------------------------------ */
  /* Statut commande                                                          */
  /* ------------------------------------------------------------------------ */

  const handleOrderStatus = async (status: OrderStatus) => {
    if (!order || updatingOrder) return;

    try {
      setUpdatingOrder(true);
      setShowOrderStatus(false);

      const updated = await updateOrderStatus({
        storeOrderId: order.store_order_id,
        storeId: order.store_id,
        status,
      });

      setOrder(updated);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de modifier le statut."
      );
    } finally {
      setUpdatingOrder(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return <OrderPageSkeleton />;
  }

  /* ------------------------------------------------------------------------ */
  /* Error                                                                    */
  /* ------------------------------------------------------------------------ */

  if (error || !order) {
    return (
      <section className="min-h-screen bg-[#fafafa] px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-5 flex items-center gap-2 text-xs font-semibold text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft size={15} />
            Retour aux commandes
          </button>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center sm:p-8">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              !
            </div>

            <h1 className="mt-4 text-sm font-semibold text-gray-900">
              Impossible d'afficher la commande
            </h1>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-gray-500">
              {error ?? "Cette commande est introuvable."}
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => void loadOrder()}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-gray-800"
              >
                <RefreshCw size={14} />
                Réessayer
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Retour
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <section className="min-h-screen bg-[#fafafa] px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
      <div className="mx-auto max-w-7xl">
        {/* ---------------------------------------------------------------- */}
        {/* HEADER                                                            */}
        {/* ---------------------------------------------------------------- */}

        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Retour"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
            >
              <ArrowLeft size={16} />
            </button>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                  Commande #{order.order_number}
                </h1>

                <span
                  className={`
                    inline-flex
                    rounded-full
                    border
                    px-2 py-1
                    text-[10px]
                    font-medium
                    ${STATUS_STYLES[order.order_status] ?? "border-gray-200 bg-gray-50 text-gray-600"}
                  `}
                >
                  {STATUS_LABELS[order.order_status] ??
                    order.order_status}
                </span>
              </div>

              <p className="mt-1 flex items-center gap-1.5 text-[10px] text-gray-400 sm:text-xs">
                <Clock3 size={11} />
                {formatDate(order.created_at)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadOrder()}
            disabled={loading}
            className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-[10px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 sm:text-xs"
          >
            <RefreshCw size={13} />
            Actualiser
          </button>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* ERROR INLINE                                                      */}
        {/* ---------------------------------------------------------------- */}

        {error && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
            <span className="min-w-0">{error}</span>

            <button
              type="button"
              onClick={() => setError(null)}
              className="shrink-0 font-semibold"
            >
              Fermer
            </button>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* SUMMARY                                                           */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Total */}
          <div className="flex min-w-0 flex-col justify-between rounded-xl border border-gray-200 bg-white px-3.5 py-3 shadow-xs sm:px-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-gray-700">
                Total commande
              </p>

              <CreditCard
                size={14}
                className="text-gray-400"
              />
            </div>

            <p className="mt-2 truncate font-mono text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">
              {formatAmount(
                order.total_amount,
                order.currency
              )}
            </p>
          </div>

          {/* Articles */}
          <div className="flex min-w-0 flex-col justify-between rounded-xl border border-gray-200 bg-white px-3.5 py-3 shadow-xs sm:px-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-gray-700">
                Articles
              </p>

              <ShoppingBag
                size={14}
                className="text-gray-400"
              />
            </div>

            <p className="mt-2 font-mono text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">
              {totalQuantity}
            </p>

            <p className="mt-1 text-[10px] text-gray-400">
              {items.length} produit
              {items.length > 1 ? "s" : ""}
            </p>
          </div>

          {/* Paiement */}
          <div className="flex min-w-0 flex-col justify-between rounded-xl border border-gray-200 bg-white px-3.5 py-3 shadow-xs sm:px-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-gray-700">
                Paiement
              </p>

              <span
                className={`
                  inline-flex
                  rounded-full
                  border
                  px-2 py-1
                  text-[10px]
                  font-medium
                  ${PAYMENT_STYLES[order.payment_status] ?? "border-gray-200 bg-gray-50 text-gray-600"}
                `}
              >
                {PAYMENT_LABELS[order.payment_status] ??
                  order.payment_status}
              </span>
            </div>

            <p className="mt-2 truncate text-sm font-semibold text-gray-900">
              {order.payment_method}
            </p>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* MAIN                                                              */}
        {/* ---------------------------------------------------------------- */}

        <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]">
          {/* ============================================================ */}
          {/* LEFT                                                           */}
          {/* ============================================================ */}

          <div className="min-w-0 space-y-4">
            {/* Articles */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3.5 sm:px-5">
                <div>
                  <h2 className="text-xs font-semibold text-gray-900 sm:text-sm">
                    Articles commandés
                  </h2>

                  <p className="mt-1 text-[10px] text-gray-400">
                    Détail des produits de cette commande
                  </p>
                </div>

                <Package
                  size={16}
                  className="shrink-0 text-gray-400"
                />
              </div>

              {items.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <ShoppingBag
                    size={22}
                    className="mx-auto text-gray-300"
                  />

                  <p className="mt-3 text-xs font-medium text-gray-600">
                    Aucun article trouvé
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const subtotal =
                      Number(item.unit_price) * item.quantity;

                    return (
                      <div
                        key={item.id}
                        className="flex min-w-0 flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                          <Package
                            size={17}
                            className="text-gray-500"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-gray-900 sm:text-sm">
                            {item.product_name}
                          </p>

                          {item.selected_variant && (
                            <p className="mt-1 truncate text-[10px] text-gray-400">
                              Variante :{" "}
                              {item.selected_variant}
                            </p>
                          )}

                          <p className="mt-1 text-[10px] text-gray-400">
                            {formatAmount(
                              item.unit_price,
                              order.currency
                            )}{" "}
                            × {item.quantity}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                          <span className="text-[10px] text-gray-400 sm:hidden">
                            Sous-total
                          </span>

                          <p className="font-mono text-xs font-semibold text-gray-900">
                            {formatAmount(
                              subtotal,
                              order.currency
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Total */}
              <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-4 sm:px-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-medium text-gray-500">
                    Total
                  </span>

                  <span className="font-mono text-sm font-semibold text-gray-900">
                    {formatAmount(
                      order.total_amount,
                      order.currency
                    )}
                  </span>
                </div>

                {itemsTotal !== Number(order.total_amount) && (
                  <p className="mt-2 text-[10px] text-gray-400">
                    Le total des articles est de{" "}
                    {formatAmount(
                      itemsTotal,
                      order.currency
                    )}
                    .
                  </p>
                )}
              </div>
            </section>

            {/* Notes */}
            {order.notes && (
              <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
                <h2 className="text-xs font-semibold text-gray-900 sm:text-sm">
                  Notes
                </h2>

                <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-gray-600">
                  {order.notes}
                </p>
              </section>
            )}
          </div>

          {/* ============================================================ */}
          {/* RIGHT                                                          */}
          {/* ============================================================ */}

          <div className="min-w-0 space-y-4">
            {/* Client */}
            <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-white">
                  <User size={13} />
                </div>

                <h2 className="text-xs font-semibold text-gray-900 sm:text-sm">
                  Informations client
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex gap-3">
                  <User
                    size={15}
                    className="mt-0.5 shrink-0 text-gray-400"
                  />

                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400">
                      Client
                    </p>

                    <p className="mt-1 truncate text-xs font-medium text-gray-900">
                      {order.customer_name}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Phone
                    size={15}
                    className="mt-0.5 shrink-0 text-gray-400"
                  />

                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400">
                      Téléphone
                    </p>

                    <p className="mt-1 truncate text-xs font-medium text-gray-900">
                      {order.customer_phone}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <MapPin
                    size={15}
                    className="mt-0.5 shrink-0 text-gray-400"
                  />

                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400">
                      Adresse
                    </p>

                    <p className="mt-1 text-xs font-medium leading-5 text-gray-900">
                      {order.shipping_address}
                    </p>

                    <p className="mt-1 text-[10px] text-gray-400">
                      {order.city}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Statut commande */}
            <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
              <h2 className="text-xs font-semibold text-gray-900 sm:text-sm">
                Gestion de la commande
              </h2>

              <p className="mt-1 text-[10px] text-gray-400">
                Modifie le statut directement depuis cette page.
              </p>

              <div className="relative mt-4">
                <button
                  type="button"
                  disabled={updatingOrder}
                  onClick={() =>
                    setShowOrderStatus(
                      (current) => !current
                    )
                  }
                  className="flex min-h-10 w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-800 transition hover:bg-gray-50 disabled:opacity-60"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`
                        h-2 w-2 rounded-full
                        ${
                          order.order_status ===
                          "cancelled"
                            ? "bg-rose-500"
                            : order.order_status ===
                                "delivered"
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                        }
                      `}
                    />

                    {updatingOrder
                      ? "Modification..."
                      : STATUS_LABELS[
                          order.order_status
                        ] ?? order.order_status}
                  </span>

                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      showOrderStatus
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {showOrderStatus && (
                  <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
                    {(
                      [
                        "pending",
                        "confirmed",
                        "processing",
                        "shipped",
                        "delivered",
                        "cancelled",
                      ] as OrderStatus[]
                    ).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          void handleOrderStatus(
                            status
                          )
                        }
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs text-gray-700 transition hover:bg-gray-50"
                      >
                        {STATUS_LABELS[status]}

                        {order.order_status ===
                          status && (
                          <Check
                            size={14}
                            className="text-gray-900"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Paiement */}
            <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
              <h2 className="text-xs font-semibold text-gray-900 sm:text-sm">
                Paiement
              </h2>

              <div className="mt-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] text-gray-400">
                    Méthode
                  </span>

                  <span className="text-xs font-medium text-gray-900">
                    {order.payment_method}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-[10px] text-gray-400">
                    Statut
                  </span>

                  <span
                    className={`
                      rounded-full
                      border
                      px-2 py-1
                      text-[10px]
                      font-medium
                      ${
                        PAYMENT_STYLES[
                          order.payment_status
                        ] ??
                        "border-gray-200 bg-gray-50 text-gray-600"
                      }
                    `}
                  >
                    {PAYMENT_LABELS[
                      order.payment_status
                    ] ?? order.payment_status}
                  </span>
                </div>
              </div>

            </section>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderPage;