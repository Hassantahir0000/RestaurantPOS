"use client";

import { useMemo, useState } from "react";
import { Search, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import type { Category, MenuItem, MenuItemVariant } from "@prisma/client";
import type { CartLine } from "./types";

type ItemWithVariants = MenuItem & { variants: MenuItemVariant[] };
type CategoryWithItems = Category & { menuItems: ItemWithVariants[] };

export function MenuGrid({
  categories,
  onAdd,
}: {
  categories: CategoryWithItems[];
  onAdd: (line: Omit<CartLine, "quantity">) => void;
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id ?? "");
  const [search, setSearch] = useState("");

  const activeItems = useMemo(() => {
    const source = search.trim()
      ? categories.flatMap((c) => c.menuItems)
      : categories.find((c) => c.id === selectedCategoryId)?.menuItems ?? [];

    if (!search.trim()) return source;
    const q = search.toLowerCase();
    return source.filter((i) => i.name.toLowerCase().includes(q));
  }, [categories, selectedCategoryId, search]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <Input
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {!search && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategoryId(c.id)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                  selectedCategoryId === c.id
                    ? "bg-brand text-white"
                    : "bg-surface-muted text-ink-soft hover:bg-border/60"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeItems.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-soft">No items found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {activeItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "rounded-xl border border-border bg-surface p-3.5 transition-shadow",
                  !item.available && "opacity-50"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-snug text-ink">{item.name}</p>
                  {!item.available && <EyeOff className="h-3.5 w-3.5 shrink-0 text-ink-soft" />}
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {item.variants.map((v) => (
                    <button
                      key={v.id}
                      disabled={!item.available}
                      onClick={() =>
                        onAdd({
                          key: v.id,
                          menuItemId: item.id,
                          variantId: v.id,
                          itemName: item.name,
                          variantLabel: v.label,
                          unitPrice: v.price,
                        })
                      }
                      className="rounded-lg bg-surface-muted px-2.5 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-brand hover:text-white disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                    >
                      {v.label !== "Regular" && <span className="opacity-70">{v.label} · </span>}
                      {formatCurrency(v.price)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
