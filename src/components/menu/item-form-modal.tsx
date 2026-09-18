"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { saveMenuItem } from "@/lib/actions/menu";
import { toast } from "sonner";
import type { Category, MenuItem, MenuItemVariant } from "@prisma/client";

type ItemWithVariants = MenuItem & { variants: MenuItemVariant[] };

type VariantRow = { id?: string; label: string; price: string };

export function ItemFormModal({
  onClose,
  categories,
  editingItem,
  defaultCategoryId,
}: {
  onClose: () => void;
  categories: Category[];
  editingItem?: ItemWithVariants | null;
  defaultCategoryId?: string;
}) {
  const [name, setName] = useState(editingItem?.name ?? "");
  const [description, setDescription] = useState(editingItem?.description ?? "");
  const [categoryId, setCategoryId] = useState(
    editingItem?.categoryId ?? defaultCategoryId ?? categories[0]?.id ?? ""
  );
  const [available, setAvailable] = useState(editingItem?.available ?? true);
  const [variants, setVariants] = useState<VariantRow[]>(
    editingItem?.variants.length
      ? editingItem.variants.map((v) => ({ id: v.id, label: v.label, price: String(v.price) }))
      : [{ label: "Regular", price: "" }]
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function updateVariant(idx: number, patch: Partial<VariantRow>) {
    setVariants((prev) => prev.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  }

  function addVariant() {
    setVariants((prev) => [...prev, { label: "", price: "" }]);
  }

  function removeVariant(idx: number) {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      id: editingItem?.id,
      name,
      description,
      categoryId,
      available,
      variants: variants
        .filter((v) => v.label.trim() && v.price !== "")
        .map((v) => ({ id: v.id, label: v.label.trim(), price: Number(v.price) })),
    };

    if (payload.variants.length === 0) {
      setError("Add at least one price variant");
      return;
    }

    startTransition(async () => {
      const result = await saveMenuItem(payload);
      if (result.success) {
        toast.success(editingItem ? "Item updated" : "Item added");
        onClose();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Modal open onClose={onClose} title={editingItem ? "Edit item" : "Add item"} className="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="item-name">Item name</Label>
          <Input id="item-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="item-category">Category</Label>
            <Select id="item-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="item-available">Availability</Label>
            <Select
              id="item-available"
              value={available ? "true" : "false"}
              onChange={(e) => setAvailable(e.target.value === "true")}
            >
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="item-description">Description (optional)</Label>
          <Textarea
            id="item-description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label className="mb-0">Price variants</Label>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-1 text-xs font-medium text-brand hover:underline cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add variant
            </button>
          </div>
          <div className="space-y-2">
            {variants.map((v, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  placeholder="Label (e.g. Small, Family)"
                  value={v.label}
                  onChange={(e) => updateVariant(idx, { label: e.target.value })}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min="0"
                  placeholder="Price"
                  value={v.price}
                  onChange={(e) => updateVariant(idx, { price: e.target.value })}
                  className="w-28"
                />
                <button
                  type="button"
                  onClick={() => removeVariant(idx)}
                  disabled={variants.length === 1}
                  className="rounded-lg p-2 text-ink-soft transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-30 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {editingItem ? "Save changes" : "Add item"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
