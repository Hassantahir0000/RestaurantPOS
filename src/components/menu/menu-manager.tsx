"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Search, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CategoryFormModal } from "./category-form-modal";
import { ItemFormModal } from "./item-form-modal";
import { deleteCategory, deleteMenuItem, toggleItemAvailability } from "@/lib/actions/menu";
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Category, MenuItem, MenuItemVariant } from "@prisma/client";

type ItemWithVariants = MenuItem & { variants: MenuItemVariant[] };
type CategoryWithItems = Category & { menuItems: ItemWithVariants[] };

export function MenuManager({ categories }: { categories: CategoryWithItems[] }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | "all">(
    categories[0]?.id ?? "all"
  );
  const [search, setSearch] = useState("");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemWithVariants | null>(null);
  const [, startTransition] = useTransition();

  const flatItems = useMemo(
    () =>
      categories.flatMap((c) =>
        c.menuItems.map((item) => ({ ...item, categoryName: c.name }))
      ),
    [categories]
  );

  const visibleItems = useMemo(() => {
    let items =
      selectedCategoryId === "all"
        ? flatItems
        : flatItems.filter((i) => i.categoryId === selectedCategoryId);

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q));
    }
    return items;
  }, [flatItems, selectedCategoryId, search]);

  function handleAddItem(categoryId?: string) {
    setEditingItem(null);
    setItemModalOpen(true);
    if (categoryId) setSelectedCategoryId(categoryId);
  }

  function handleEditItem(item: ItemWithVariants) {
    setEditingItem(item);
    setItemModalOpen(true);
  }

  function handleDeleteItem(item: ItemWithVariants) {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteMenuItem(item.id);
      if (result.success) toast.success("Item deleted");
      else toast.error(result.error);
    });
  }

  function handleToggleAvailability(item: ItemWithVariants) {
    startTransition(async () => {
      const result = await toggleItemAvailability(item.id, !item.available);
      if (!result.success) toast.error(result.error);
    });
  }

  function handleDeleteCategory(category: Category) {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    startTransition(async () => {
      const result = await deleteCategory(category.id);
      if (result.success) {
        toast.success("Category deleted");
        if (selectedCategoryId === category.id) setSelectedCategoryId("all");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_1fr]">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-soft">Categories</h2>
          <button
            onClick={() => {
              setEditingCategory(null);
              setCategoryModalOpen(true);
            }}
            className="rounded-lg p-1.5 text-brand transition-colors hover:bg-brand-soft cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          <button
            onClick={() => setSelectedCategoryId("all")}
            className={cn(
              "flex shrink-0 items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
              selectedCategoryId === "all" ? "bg-ink text-white" : "bg-surface text-ink hover:bg-surface-muted border border-border"
            )}
          >
            All items
            <span className="ml-3 text-xs opacity-60">{flatItems.length}</span>
          </button>
          {categories.map((category) => (
            <div
              key={category.id}
              className={cn(
                "group flex shrink-0 items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                selectedCategoryId === category.id
                  ? "bg-ink text-white"
                  : "bg-surface text-ink hover:bg-surface-muted border border-border"
              )}
              onClick={() => setSelectedCategoryId(category.id)}
            >
              <span className="truncate">{category.name}</span>
              <div className="ml-2 flex items-center gap-1">
                <span className="text-xs opacity-60">{category.menuItems.length}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCategory(category);
                    setCategoryModalOpen(true);
                  }}
                  className={cn(
                    "hidden rounded p-1 hover:opacity-80 lg:group-hover:block",
                    selectedCategoryId === category.id ? "text-white" : "text-ink-soft"
                  )}
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(category);
                  }}
                  className={cn(
                    "hidden rounded p-1 hover:opacity-80 lg:group-hover:block",
                    selectedCategoryId === category.id ? "text-white" : "text-ink-soft"
                  )}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => handleAddItem(selectedCategoryId !== "all" ? selectedCategoryId : undefined)}>
            <Plus className="h-4 w-4" />
            Add item
          </Button>
        </div>

        {visibleItems.length === 0 ? (
          <Card>
            <div className="py-12 text-center text-sm text-ink-soft">No items found.</div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => (
              <Card key={item.id} className={cn("p-4", !item.available && "opacity-60")}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{item.name}</p>
                    {selectedCategoryId === "all" && (
                      <p className="text-xs text-ink-soft">{item.categoryName}</p>
                    )}
                  </div>
                  {!item.available && (
                    <Badge variant="danger">
                      <EyeOff className="h-3 w-3" /> 86&apos;d
                    </Badge>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.variants.map((v) => (
                    <span
                      key={v.id}
                      className="rounded-lg bg-surface-muted px-2 py-1 text-xs font-medium text-ink-soft"
                    >
                      {v.label} · {formatCurrency(v.price)}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditItem(item)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button variant="subtle" size="sm" onClick={() => handleToggleAvailability(item)}>
                    {item.available ? "86 it" : "Restore"}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item)}>
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {categoryModalOpen && (
        <CategoryFormModal
          onClose={() => setCategoryModalOpen(false)}
          editingCategory={editingCategory}
        />
      )}
      {itemModalOpen && (
        <ItemFormModal
          key={editingItem?.id ?? "new"}
          onClose={() => setItemModalOpen(false)}
          categories={categories}
          editingItem={editingItem}
          defaultCategoryId={selectedCategoryId !== "all" ? selectedCategoryId : undefined}
        />
      )}
    </div>
  );
}
