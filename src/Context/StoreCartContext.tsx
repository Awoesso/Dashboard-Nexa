import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export interface StoreCartItem {
  productId: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
}

type StoreCartContextValue = {
  items: StoreCartItem[];
  addItem: (item: Omit<StoreCartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const StoreCartContext = createContext<StoreCartContextValue | undefined>(undefined);

export const StoreCartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<StoreCartItem[]>([]);

  const value = useMemo<StoreCartContextValue>(
    () => ({
      items,
      addItem: (item) => {
        setItems((current) => {
          const existing = current.find((entry) => entry.productId === item.productId);
          if (!existing) return [...current, { ...item, quantity: 1 }];
          return current.map((entry) =>
            entry.productId === item.productId
              ? { ...entry, quantity: entry.quantity + 1 }
              : entry,
          );
        });
      },
      removeItem: (productId) => {
        setItems((current) => current.filter((entry) => entry.productId !== productId));
      },
      clear: () => setItems([]),
    }),
    [items],
  );

  return <StoreCartContext.Provider value={value}>{children}</StoreCartContext.Provider>;
};

export const useStoreCart = () => {
  const context = useContext(StoreCartContext);
  if (!context) throw new Error("useStoreCart must be used within StoreCartProvider");
  return context;
};
