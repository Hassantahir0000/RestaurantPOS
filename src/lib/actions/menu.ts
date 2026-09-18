"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const variantSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, "Variant label is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
});

const itemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  available: z.coerce.boolean().default(true),
  variants: z.array(variantSchema).min(1, "At least one price variant is required"),
});

export type ActionResult = { success: true } | { success: false; error: string };

export async function createCategory(name: string): Promise<ActionResult> {
  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Category name is required" };

  try {
    const maxSort = await prisma.category.aggregate({ _max: { sortOrder: true } });
    await prisma.category.create({
      data: { name: trimmed, sortOrder: (maxSort._max.sortOrder ?? -1) + 1 },
    });
    revalidatePath("/menu");
    return { success: true };
  } catch {
    return { success: false, error: "A category with that name already exists" };
  }
}

export async function renameCategory(id: string, name: string): Promise<ActionResult> {
  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Category name is required" };

  try {
    await prisma.category.update({ where: { id }, data: { name: trimmed } });
    revalidatePath("/menu");
    return { success: true };
  } catch {
    return { success: false, error: "Could not rename category" };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const itemCount = await prisma.menuItem.count({ where: { categoryId: id } });
  if (itemCount > 0) {
    return { success: false, error: "Move or delete items in this category first" };
  }
  await prisma.category.delete({ where: { id } });
  revalidatePath("/menu");
  return { success: true };
}

export async function saveMenuItem(input: unknown): Promise<ActionResult> {
  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { id, name, description, categoryId, available, variants } = parsed.data;

  try {
    if (id) {
      const existingVariantIds = (
        await prisma.menuItemVariant.findMany({ where: { menuItemId: id }, select: { id: true } })
      ).map((v) => v.id);
      const keepIds = variants.filter((v) => v.id).map((v) => v.id as string);
      const removeIds = existingVariantIds.filter((vid) => !keepIds.includes(vid));

      await prisma.$transaction([
        prisma.menuItem.update({
          where: { id },
          data: { name, description: description || null, categoryId, available },
        }),
        ...(removeIds.length
          ? [prisma.menuItemVariant.deleteMany({ where: { id: { in: removeIds } } })]
          : []),
        ...variants.map((v, idx) =>
          v.id
            ? prisma.menuItemVariant.update({
                where: { id: v.id },
                data: { label: v.label, price: v.price, sortOrder: idx },
              })
            : prisma.menuItemVariant.create({
                data: { menuItemId: id, label: v.label, price: v.price, sortOrder: idx },
              })
        ),
      ]);
    } else {
      await prisma.menuItem.create({
        data: {
          name,
          description: description || null,
          categoryId,
          available,
          variants: {
            create: variants.map((v, idx) => ({ label: v.label, price: v.price, sortOrder: idx })),
          },
        },
      });
    }

    revalidatePath("/menu");
    revalidatePath("/pos");
    return { success: true };
  } catch {
    return { success: false, error: "Could not save item" };
  }
}

export async function deleteMenuItem(id: string): Promise<ActionResult> {
  try {
    await prisma.menuItem.delete({ where: { id } });
    revalidatePath("/menu");
    revalidatePath("/pos");
    return { success: true };
  } catch {
    return { success: false, error: "Could not delete item" };
  }
}

export async function toggleItemAvailability(id: string, available: boolean): Promise<ActionResult> {
  try {
    await prisma.menuItem.update({ where: { id }, data: { available } });
    revalidatePath("/menu");
    revalidatePath("/pos");
    return { success: true };
  } catch {
    return { success: false, error: "Could not update item" };
  }
}
