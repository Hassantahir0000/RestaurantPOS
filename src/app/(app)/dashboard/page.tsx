import Link from "next/link";
import { Wallet, Receipt, Activity, TrendingUp, Plus } from "lucide-react";
import { getDashboardStats } from "@/lib/stats";
import { StatTile } from "@/components/dashboard/stat-tile";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { TopItems } from "@/components/dashboard/top-items";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge, OrderTypeBadge } from "@/components/orders/order-status-badge";
import { formatCurrency, formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Dashboard</h1>
          <p className="text-sm text-ink-soft">Today&apos;s performance at a glance.</p>
        </div>
        <Link href="/pos">
          <Button size="lg">
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Today's Revenue" value={formatCurrency(stats.todayRevenue)} icon={Wallet} accent="brand" />
        <StatTile label="Today's Orders" value={String(stats.todayOrderCount)} icon={Receipt} accent="dark" />
        <StatTile
          label="Avg. Order Value"
          value={formatCurrency(Math.round(stats.avgOrderValue))}
          icon={TrendingUp}
          accent="success"
        />
        <StatTile label="Active Orders" value={String(stats.activeOrders)} icon={Activity} accent="warning" sub="In the kitchen queue" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue — last 7 days</CardTitle>
            <span className="text-sm font-semibold text-ink">{formatCurrency(stats.weekRevenue)}</span>
          </CardHeader>
          <CardContent>
            <RevenueChart data={stats.revenueTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top sellers this week</CardTitle>
          </CardHeader>
          <CardContent>
            <TopItems items={stats.topItems} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
          <Link href="/orders" className="text-xs font-medium text-brand hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          {stats.recentOrders.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-ink-soft">No orders yet. Create your first order.</p>
          ) : (
            <div className="divide-y divide-border">
              {stats.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 text-sm transition-colors hover:bg-surface-muted"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-ink-soft">#{order.orderNumber}</span>
                    <div>
                      <p className="font-medium text-ink">
                        {order.customerName || (order.tableNumber ? `Table ${order.tableNumber}` : "Walk-in")}
                      </p>
                      <p className="text-xs text-ink-soft">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {formatTime(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <OrderTypeBadge type={order.type} />
                    <OrderStatusBadge status={order.status} />
                    <span className="w-20 text-right font-semibold text-ink">{formatCurrency(order.total)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
