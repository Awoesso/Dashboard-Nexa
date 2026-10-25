import { supabase } from "@/lib/supabase";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export interface Order {
  store_order_id: string;
  order_id: string;
  store_id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  total_amount: number;
  currency: string;
  payment_method: string;
  payment_status: PaymentStatus | string;
  order_status: OrderStatus | string;
  notes: string | null;
  created_at: string;
}

export interface UpdateOrderStatusInput {
  storeOrderId: string;
  storeId: string;
  status: OrderStatus;
}

export interface UpdatePaymentStatusInput {
  orderId: string;
  status: PaymentStatus;
}

export interface OrderItem {
  id: string;
  order_id: string;
  store_id: string | null;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  selected_variant: string | null;
  created_at: string;
}

export async function getOrderItems(
  orderId: string,
  storeId: string
): Promise<OrderItem[]> {
  if (!orderId || !storeId) {
    throw new Error("Les identifiants de la commande et de la boutique sont requis.");
  }

  const { data, error } = await supabase
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
    .eq("order_id", orderId)
    .eq("store_id", storeId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erreur récupération articles :", error);
    throw new Error(
      `Impossible de récupérer les articles : ${error.message}`
    );
  }

  return (data ?? []) as OrderItem[];
}
/* -------------------------------------------------------------------------- */
/* Constantes                                                                 */
/* -------------------------------------------------------------------------- */

const ORDER_COLUMNS = `
  store_order_id,
  order_id,
  store_id,
  store_total,
  store_currency,
  store_order_created_at,
  order_number,
  customer_name,
  customer_phone,
  shipping_address,
  city,
  payment_method,
  payment_status,
  order_status,
  notes
`;

interface VendorOrderRow {
  store_order_id: string;
  order_id: string;
  store_id: string;
  store_total: number | string;
  store_currency: string;
  store_order_created_at: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  payment_method: string;
  payment_status: PaymentStatus | string;
  order_status: OrderStatus | string;
  notes: string | null;
}

const mapVendorOrder = (row: VendorOrderRow): Order => ({
  store_order_id: row.store_order_id,
  order_id: row.order_id,
  store_id: row.store_id,
  order_number: row.order_number,
  customer_name: row.customer_name,
  customer_phone: row.customer_phone,
  shipping_address: row.shipping_address,
  city: row.city,
  total_amount: Number(row.store_total),
  currency: row.store_currency,
  payment_method: row.payment_method,
  payment_status: row.payment_status,
  order_status: row.order_status,
  notes: row.notes,
  created_at: row.store_order_created_at,
});

/* -------------------------------------------------------------------------- */
/* Récupérer toutes les commandes                         A                    */
/* -------------------------------------------------------------------------- */

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("vendor_orders")
    .select(ORDER_COLUMNS)
    .order("store_order_created_at", { ascending: false });

  if (error) {
    console.error("Erreur récupération commandes :", error);
    throw new Error(
      `Impossible de récupérer les commandes : ${error.message}`
    );
  }

  return ((data ?? []) as VendorOrderRow[]).map(mapVendorOrder);
}

/* -------------------------------------------------------------------------- */
/* Récupérer une commande                                                     */
/* -------------------------------------------------------------------------- */

export async function getOrderByStoreOrderId(
  storeOrderId: string
): Promise<Order | null> {
  if (!storeOrderId) {
    throw new Error("L'identifiant de la sous-commande est requis.");
  }

  const { data, error } = await supabase
    .from("vendor_orders")
    .select(ORDER_COLUMNS)
    .eq("store_order_id", storeOrderId)
    .maybeSingle();

  if (error) {
    console.error("Erreur récupération commande :", error);
    throw new Error(
      `Impossible de récupérer la commande : ${error.message}`
    );
  }

  return data ? mapVendorOrder(data as VendorOrderRow) : null;
}

/* -------------------------------------------------------------------------- */
/* Modifier le statut de la commande                                          */
/* -------------------------------------------------------------------------- */

export async function updateOrderStatus({
  storeOrderId,
  storeId,
  status,
}: UpdateOrderStatusInput): Promise<Order> {
  if (!storeOrderId || !storeId) {
    throw new Error("Les identifiants de la sous-commande et de la boutique sont requis.");
  }

  const { data, error } = await supabase
    .from("store_orders")
    .update({
      order_status: status,
    })
    .eq("id", storeOrderId)
    .eq("store_id", storeId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Erreur modification statut commande :", error);
    throw new Error(
      `Impossible de modifier le statut : ${error.message}`
    );
  }

  if (!data) {
    throw new Error("Sous-commande introuvable ou non accessible pour cette boutique.");
  }

  const order = await getOrderByStoreOrderId(storeOrderId);

  if (!order) {
    throw new Error("Commande introuvable.");
  }

  return order;
}

export async function updatePaymentStatus({
  orderId,
}: UpdatePaymentStatusInput): Promise<Order> {
  if (!orderId) {
    throw new Error("L'identifiant de la commande est requis.");
  }

  throw new Error("Le statut du paiement doit être modifié par le backend de paiement.");
}

/* -------------------------------------------------------------------------- */
/* Realtime : commandes                                                       */
/* -------------------------------------------------------------------------- */

export function subscribeToOrders(
  onInsert: (order: Order) => void,
  onUpdate?: (order: Order) => void,
  onDelete?: (storeOrderId: string) => void
) {
  const channel = supabase
    .channel("nexa-orders")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "store_orders",
      },
      (payload) => {
        const storeOrderId = payload.new.id;
        if (typeof storeOrderId === "string") {
          void getOrderByStoreOrderId(storeOrderId).then((order) => {
            if (order) onInsert(order);
          });
        }
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "store_orders",
      },
      (payload) => {
        const storeOrderId = payload.new.id;
        if (typeof storeOrderId === "string") {
          void getOrderByStoreOrderId(storeOrderId).then((order) => {
            if (order) onUpdate?.(order);
          });
        }
      }
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "store_orders",
      },
      (payload) => {
        const storeOrderId = payload.old.id;
        if (typeof storeOrderId === "string") onDelete?.(storeOrderId);
      }
    )
    .subscribe((status) => {
      console.log("Realtime orders :", status);
    });

  return () => {
    void supabase.removeChannel(channel);
  };
}




/* -------------------------------------------------------------------------- */
/* Wallet / résumé financier basé sur les commandes                          */
/* -------------------------------------------------------------------------- */

export interface WalletSummary {
  balances: { currency: string; amount: number }[];
  lastActivity: string | null;
}

export async function getWalletSummary(): Promise<WalletSummary> {
  const { data, error } = await supabase
    .from("vendor_orders")
    .select(`
      store_total,
      store_currency,
      payment_status,
      order_status,
      store_order_created_at
    `)
    .order("store_order_created_at", { ascending: false });

  if (error) {
    console.error("Erreur récupération wallet :", error);

    throw new Error(
      `Impossible de récupérer les données du wallet : ${error.message}`
    );
  }

  const orders = data ?? [];

  /*
   * Le solde correspond uniquement aux commandes réellement payées.
   * Les commandes annulées, échouées ou remboursées ne sont pas comptées.
   */
  const validPaidOrders = orders.filter(
    (order) =>
      order.payment_status === "paid" &&
      order.order_status !== "cancelled"
  );

  const balancesByCurrency = new Map<string, number>();
  for (const order of validPaidOrders) {
    const currency = order.store_currency || "XOF";
    const amount = Number(order.store_total || 0);
    if (Number.isFinite(amount)) {
      balancesByCurrency.set(
        currency,
        (balancesByCurrency.get(currency) ?? 0) + amount,
      );
    }
  }

  const lastActivity = orders[0]?.store_order_created_at ?? null;

  return {
    balances: [...balancesByCurrency].map(([currency, amount]) => ({
      currency,
      amount,
    })),
    lastActivity,
  };
}