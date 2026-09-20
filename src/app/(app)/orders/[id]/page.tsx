import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { OrderActions } from "@/components/orders/order-actions";
import { OrderStatusBadge, OrderTypeBadge } from "@/components/orders/order-status-badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, createdBy: true },
  });

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-8">
      <Link href="/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <div id="receipt" className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="border-b border-dashed border-border pb-4 text-center">
          <h1 className="text-xl font-bold text-ink">Zap Thoung Café</h1>
          <p className="text-sm text-ink-soft">Order #{order.orderNumber}</p>
          <p className="text-xs text-ink-soft">{formatDateTime(order.createdAt)}</p>
          <div className="mt-2 flex justify-center gap-2">
            <OrderTypeBadge type={order.type} />
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            {order.customerName || (order.tableNumber ? `Table ${order.tableNumber}` : "Walk-in")}
            {order.customerPhone ? ` · ${order.customerPhone}` : ""}
          </p>
        </div>

        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
              <th className="py-0 pb-2 pr-2">Item</th>
              <th className="py-0 pb-2 px-2 text-center">Qty</th>
              <th className="py-0 pb-2 px-2 text-right">Price</th>
              <th className="py-0 pb-2 pl-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="py-2 pr-2 text-ink">
                  {item.itemName}
                  {item.variantLabel && item.variantLabel !== "Regular" && (
                    <span className="text-ink-soft"> ({item.variantLabel})</span>
                  )}
                </td>
                <td className="py-2 px-2 text-center text-ink-soft">{item.quantity}</td>
                <td className="py-2 px-2 text-right text-ink-soft">{formatCurrency(item.unitPrice)}</td>
                <td className="py-2 pl-2 text-right font-medium text-ink">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto max-w-[220px] space-y-1 border-t border-dashed border-border pt-3 text-sm">
          <div className="flex justify-between text-ink-soft">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-ink-soft">
              <span>Discount</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          {order.tax > 0 && (
            <div className="flex justify-between text-ink-soft">
              <span>Tax</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-ink">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        {order.notes && (
          <p className="mt-4 rounded-lg bg-surface-muted px-3 py-2 text-xs text-ink-soft">Note: {order.notes}</p>
        )}

        <p className="mt-4 text-xs text-ink-soft">
          Payment: {order.paymentMethod} · {order.paymentStatus === "PAID" ? "Paid" : "Unpaid"}
          {order.createdBy ? ` · Served by ${order.createdBy.name}` : ""}
        </p>

        <p className="mt-4 border-t border-dashed border-border pt-3 text-center text-xs text-ink-soft">
          Thank you for visiting Zap Thoung Café — Feel the Taste of Royality
        </p>
      </div>

      <OrderActions orderId={order.id} status={order.status} paymentStatus={order.paymentStatus} />
    </div>
  );
}
