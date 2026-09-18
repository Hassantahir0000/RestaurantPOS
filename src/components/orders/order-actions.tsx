"use client";

import { useTransition } from "react";
import { Printer, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateOrderStatus, updatePaymentStatus } from "@/lib/actions/orders";
import { toast } from "sonner";
import type { OrderStatus, PaymentStatus } from "@prisma/client";

const FLOW: Record<OrderStatus, OrderStatus | null> = {
  PENDING: "PREPARING",
  PREPARING: "READY",
  READY: "COMPLETED",
  COMPLETED: null,
  CANCELLED: null,
};

const NEXT_LABEL: Record<string, string> = {
  PREPARING: "Start preparing",
  READY: "Mark ready",
  COMPLETED: "Complete order",
};

export function OrderActions({
  orderId,
  status,
  paymentStatus,
}: {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}) {
  const [pending, startTransition] = useTransition();
  const nextStatus = FLOW[status];

  function handleStatus(value: OrderStatus) {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, value);
      if (result.success) toast.success("Order updated");
      else toast.error(result.error);
    });
  }

  function handlePayment(value: PaymentStatus) {
    startTransition(async () => {
      await updatePaymentStatus(orderId, value);
      toast.success(value === "PAID" ? "Marked as paid" : "Marked as unpaid");
    });
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 print:hidden">
      {nextStatus && (
        <Button onClick={() => handleStatus(nextStatus)} disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {NEXT_LABEL[nextStatus]}
        </Button>
      )}
      {status !== "CANCELLED" && status !== "COMPLETED" && (
        <Button variant="outline" onClick={() => handleStatus("CANCELLED")} disabled={pending}>
          <XCircle className="h-4 w-4" />
          Cancel order
        </Button>
      )}
      <Button
        variant="subtle"
        onClick={() => handlePayment(paymentStatus === "PAID" ? "UNPAID" : "PAID")}
        disabled={pending}
      >
        Mark as {paymentStatus === "PAID" ? "unpaid" : "paid"}
      </Button>
      <Button variant="ghost" onClick={() => window.print()}>
        <Printer className="h-4 w-4" />
        Print receipt
      </Button>
    </div>
  );
}
