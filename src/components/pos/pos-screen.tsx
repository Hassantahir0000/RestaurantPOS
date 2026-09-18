"use client";

import { useMemo, useState } from "react";
import { ShoppingCart, X } from "lucide-react";
import { MenuGrid } from "./menu-grid";
import { CartPanel } from "./cart-panel";
import { formatCurrency } from "@/lib/utils";
import type { CartLine } from "./types";
import type { Category, MenuItem, MenuItemVariant } from "@prisma/client";

type ItemWithVariants = MenuItem & { variants: MenuItemVariant[] };
type CategoryWithItems = Category & { menuItems: ItemWithVariants[] };

export function PosScreen({ categories }: { categories: CategoryWithItems[] }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  const itemCount = useMemo(() => cart.reduce((sum, l) => sum + l.quantity, 0), [cart]);
  const total = useMemo(() => cart.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0), [cart]);

  function addLine(line: Omit<CartLine, "quantity">) {
    setCart((prev) => {
      const existing = prev.find((l) => l.key === line.key);
      if (existing) {
        return prev.map((l) => (l.key === line.key ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { ...line, quantity: 1 }];
    });
  }

  function increment(key: string) {
    setCart((prev) => prev.map((l) => (l.key === key ? { ...l, quantity: l.quantity + 1 } : l)));
  }

  function decrement(key: string) {
    setCart((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, quantity: l.quantity - 1 } : l))
        .filter((l) => l.quantity > 0)
    );
  }

  function remove(key: string) {
    setCart((prev) => prev.filter((l) => l.key !== key));
  }

  function cleared() {
    setCart([]);
    setMobileCartOpen(false);
  }

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col md:h-screen md:flex-row">
      <div className="flex-1 overflow-hidden">
        <MenuGrid categories={categories} onAdd={addLine} />
      </div>

      <div className="hidden w-[360px] shrink-0 border-l border-border bg-surface md:flex">
        <CartPanel cart={cart} onIncrement={increment} onDecrement={decrement} onRemove={remove} onCleared={cleared} />
      </div>

      {itemCount > 0 && !mobileCartOpen && (
        <button
          onClick={() => setMobileCartOpen(true)}
          className="fixed inset-x-4 bottom-20 z-30 flex items-center justify-between rounded-2xl bg-ink px-5 py-3.5 text-white shadow-xl md:hidden"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <ShoppingCart className="h-4 w-4" />
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </span>
          <span className="text-sm font-bold">{formatCurrency(total)}</span>
        </button>
      )}

      {mobileCartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-surface md:hidden">
          <div className="flex items-center justify-between border-b border-border p-4">
            <p className="text-sm font-semibold text-ink">Your order</p>
            <button onClick={() => setMobileCartOpen(false)} className="rounded-lg p-1.5 hover:bg-surface-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <CartPanel cart={cart} onIncrement={increment} onDecrement={decrement} onRemove={remove} onCleared={cleared} />
          </div>
        </div>
      )}
    </div>
  );
}
