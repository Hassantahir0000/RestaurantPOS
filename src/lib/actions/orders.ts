"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const cartLineSchema = z.object({
  menuItemId: z.string(),
  variantId: z.string(),
  itemName: z.string(),
  variantLabel: z.string().optional(),
  unitPrice: z.number().min(0),
  quantity: z.number().int().min(1),
});

const createOrderSchema = z.object({
  type: z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"]),
  tableNumber: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
  discount: z.number().min(0).default(0),
  taxRate: z.number().min(0).max(100).default(0),
  paymentMethod: z.enum(["CASH", "CARD", "ONLINE"]),
  paymentStatus: z.enum(["PAID", "UNPAID"]),
  items: z.array(cartLineSchema).min(1, "Add at least one item to the order"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateOrderResult = { success: true; orderId: string } | { success: false; error: string };

export async function createOrder(input: unknown): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid order" };
  }
  const data = parsed.data;
  const session = await getSession();

  const subtotal = data.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const tax = Math.round(subtotal * (data.taxRate / 100));
  const total = Math.max(subtotal + tax - data.discount, 0);

  try {
    const order = await prisma.order.create({
      data: {
        type: data.type,
        tableNumber: data.tableNumber || null,
        customerName: data.customerName || null,
        customerPhone: data.customerPhone || null,
        notes: data.notes || null,
        subtotal,
        discount: data.discount,
        tax,
        total,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        createdById: session?.userId,
        status: "PENDING",
        items: {
          create: data.items.map((i) => ({
            menuItemId: i.menuItemId,
            variantId: i.variantId,
            itemName: i.itemName,
            variantLabel: i.variantLabel,
            unitPrice: i.unitPrice,
            quantity: i.quantity,
            subtotal: i.unitPrice * i.quantity,
          })),
        },
      },
    });

    revalidatePath("/orders");
    revalidatePath("/dashboard");
    return { success: true, orderId: order.id };
  } catch {
    return { success: false, error: "Could not create order. Please try again." };
  }
}

const statusSchema = z.enum(["PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"]);

export async function updateOrderStatus(orderId: string, status: string) {
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { success: false as const, error: "Invalid status" };

  await prisma.order.update({ where: { id: orderId }, data: { status: parsed.data } });
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/dashboard");
  return { success: true as const };
}

export async function updatePaymentStatus(orderId: string, paymentStatus: "PAID" | "UNPAID") {
  await prisma.order.update({ where: { id: orderId }, data: { paymentStatus } });
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  return { success: true as const };
}
