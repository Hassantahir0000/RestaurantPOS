"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createCategory, renameCategory } from "@/lib/actions/menu";
import { toast } from "sonner";
import type { Category } from "@prisma/client";

export function CategoryFormModal({
  onClose,
  editingCategory,
}: {
  onClose: () => void;
  editingCategory?: Category | null;
}) {
  const [name, setName] = useState(editingCategory?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = editingCategory
        ? await renameCategory(editingCategory.id, name)
        : await createCategory(name);
      if (result.success) {
        toast.success(editingCategory ? "Category renamed" : "Category added");
        onClose();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Modal open onClose={onClose} title={editingCategory ? "Rename category" : "Add category"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="category-name">Category name</Label>
          <Input id="category-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
        </div>
        {error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
