import { Badge } from "@/components/ui/badge";
import type { OrderStatus, OrderType } from "@prisma/client";

const STATUS_CONFIG: Record<OrderStatus, { label: string; variant: "neutral" | "brand" | "success" | "warning" | "danger" }> = {
  PENDING: { label: "Pending", variant: "warning" },
  PREPARING: { label: "Preparing", variant: "brand" },
  READY: { label: "Ready", variant: "success" },
  COMPLETED: { label: "Completed", variant: "neutral" },
  CANCELLED: { label: "Cancelled", variant: "danger" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant={config.variant} className="receipt-badge">
      {config.label}
    </Badge>
  );
}

const TYPE_LABELS: Record<OrderType, string> = {
  DINE_IN: "Dine-in",
  TAKEAWAY: "Takeaway",
  DELIVERY: "Delivery",
};

export function OrderTypeBadge({ type }: { type: OrderType }) {
  return (
    <Badge variant="neutral" className="receipt-badge">
      {TYPE_LABELS[type]}
    </Badge>
  );
}
