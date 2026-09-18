import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price_da: number;
  image_url: string | null;
  quantity: number;
};

type Ctx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
};

const CartCtx = createContext<Ctx | null>(null);
const KEY = "alpha:cart:v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const value = useMemo<Ctx>(() => ({
    items,
    add: (item, qty = 1) => setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) return prev.map((p) => p.id === item.id ? { ...p, quantity: p.quantity + qty } : p);
      return [...prev, { ...item, quantity: qty }];
    }),
    remove: (id) => setItems((prev) => prev.filter((p) => p.id !== id)),
    setQty: (id, qty) => setItems((prev) => prev.map((p) => p.id === id ? { ...p, quantity: Math.max(1, qty) } : p)),
    clear: () => setItems([]),
    count: items.reduce((n, it) => n + it.quantity, 0),
    total: items.reduce((n, it) => n + it.quantity * it.price_da, 0),
  }), [items]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart(): Ctx {
  const ctx = useContext(CartCtx);
  if (!ctx) return { items: [], add: () => {}, remove: () => {}, setQty: () => {}, clear: () => {}, count: 0, total: 0 };
  return ctx;
}