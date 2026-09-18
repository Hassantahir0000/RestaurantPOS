import { formatCurrency } from "@/lib/utils";

export function TopItems({ items }: { items: { name: string; quantity: number; revenue: number }[] }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-ink-soft">No sales yet this week.</p>;
  }

  const max = Math.max(...items.map((i) => i.quantity), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.name}>
          <div className="mb-1 flex items-center justify-between gap-2 text-sm">
            <span className="truncate font-medium text-ink">{item.name}</span>
            <span className="shrink-0 text-ink-soft">{formatCurrency(item.revenue)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${Math.max((item.quantity / max) * 100, 6)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
