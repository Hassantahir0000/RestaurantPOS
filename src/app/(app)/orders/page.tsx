import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OrderStatusBadge, OrderTypeBadge } from "@/components/orders/order-status-badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Prisma, OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY", label: "Ready" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "";
  const q = params.q?.trim() ?? "";

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status: status as OrderStatus } : {}),
    ...(q
      ? {
          OR: [
            { customerName: { contains: q } },
            { tableNumber: { contains: q } },
            ...(Number.isFinite(Number(q)) ? [{ orderNumber: Number(q) }] : []),
          ],
        }
      : {}),
  };

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: true },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Orders</h1>
          <p className="text-sm text-ink-soft">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
        </div>
        <form method="get" className="flex items-center gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search order #, table, customer..."
            className="h-10 w-64 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </form>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={{ pathname: "/orders", query: { ...(tab.value ? { status: tab.value } : {}), ...(q ? { q } : {}) } }}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              status === tab.value ? "bg-ink text-white" : "bg-surface-muted text-ink-soft hover:bg-border/60"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {orders.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink-soft">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Customer / Table</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-surface-muted/50">
                    <td className="px-4 py-3">
                      <Link href={`/orders/${order.id}`} className="font-mono text-xs font-semibold text-brand hover:underline">
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <OrderTypeBadge type={order.type} />
                    </td>
                    <td className="px-4 py-3 text-ink">
                      {order.customerName || (order.tableNumber ? `Table ${order.tableNumber}` : "Walk-in")}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{order.items.length}</td>
                    <td className="px-4 py-3 text-ink-soft">{formatDateTime(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-ink">{formatCurrency(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
