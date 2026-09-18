"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import { createOrder } from "@/lib/actions/orders";
import { toast } from "sonner";
import type { CartLine } from "./types";

const ORDER_TYPES = [
  { value: "DINE_IN", label: "Dine-in" },
  { value: "TAKEAWAY", label: "Takeaway" },
  { value: "DELIVERY", label: "Delivery" },
] as const;

export function CartPanel({
  cart,
  onIncrement,
  onDecrement,
  onRemove,
  onCleared,
}: {
  cart: CartLine[];
  onIncrement: (key: string) => void;
  onDecrement: (key: string) => void;
  onRemove: (key: string) => void;
  onCleared: () => void;
}) {
  const router = useRouter();
  const [orderType, setOrderType] = useState<(typeof ORDER_TYPES)[number]["value"]>("DINE_IN");
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "ONLINE">("CASH");
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "UNPAID">("UNPAID");
  const [pending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const subtotal = useMemo(() => cart.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0), [cart]);
  const discountValue = Number(discount) || 0;
  const total = Math.max(subtotal - discountValue, 0);

  function updateScrollShadows() {
    const el = listRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 4);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  }

  useEffect(() => {
    // The scroll container's own box size never changes (it's fixed by the
    // flex layout) — only its content's scrollHeight does as cart lines are
    // added/removed, which ResizeObserver on the container won't report.
    updateScrollShadows();
  }, [cart]);

  function handleSubmit() {
    if (cart.length === 0) {
      toast.error("Add at least one item to the order");
      return;
    }
    if (orderType === "DINE_IN" && !tableNumber.trim()) {
      toast.error("Enter a table number for dine-in orders");
      return;
    }

    startTransition(async () => {
      const result = await createOrder({
        type: orderType,
        tableNumber: orderType === "DINE_IN" ? tableNumber : undefined,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        notes: notes || undefined,
        discount: discountValue,
        taxRate: 0,
        paymentMethod,
        paymentStatus,
        items: cart.map((l) => ({
          menuItemId: l.menuItemId,
          variantId: l.variantId,
          itemName: l.itemName,
          variantLabel: l.variantLabel,
          unitPrice: l.unitPrice,
          quantity: l.quantity,
        })),
      });

      if (result.success) {
        toast.success(`Order placed`);
        onCleared();
        router.push(`/orders/${result.orderId}`);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <ShoppingCart className="h-4 w-4" />
          Current order
        </h2>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {ORDER_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setOrderType(t.value)}
              className={cn(
                "rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer",
                orderType === t.value ? "bg-ink text-white" : "bg-surface-muted text-ink-soft hover:bg-border/60"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {orderType === "DINE_IN" ? (
            <div className="col-span-2">
              <Label htmlFor="table-number">Table number</Label>
              <Input
                id="table-number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="e.g. 12"
              />
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="customer-name">Customer name</Label>
                <Input id="customer-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="customer-phone">Phone</Label>
                <Input id="customer-phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-linear-to-b from-surface to-transparent transition-opacity",
            canScrollUp ? "opacity-100" : "opacity-0"
          )}
        />
        <div ref={listRef} onScroll={updateScrollShadows} className="h-full overflow-y-auto p-4">
        {cart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-ink-soft">
            <ShoppingCart className="mb-2 h-8 w-8 opacity-30" />
            <p className="text-sm">Tap menu items to add them here.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {cart.map((line) => (
              <li key={line.key} className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{line.itemName}</p>
                  <p className="text-xs text-ink-soft">
                    {line.variantLabel !== "Regular" && `${line.variantLabel} · `}
                    {formatCurrency(line.unitPrice)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onDecrement(line.key)}
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-surface-muted text-ink-soft hover:bg-border/60 cursor-pointer"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-5 text-center text-sm font-semibold text-ink">{line.quantity}</span>
                  <button
                    onClick={() => onIncrement(line.key)}
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-surface-muted text-ink-soft hover:bg-border/60 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onRemove(line.key)}
                    className="ml-1 flex h-6 w-6 items-center justify-center rounded-md text-ink-soft hover:bg-danger-soft hover:text-danger cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        </div>
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6 bg-linear-to-t from-surface to-transparent transition-opacity",
            canScrollDown ? "opacity-100" : "opacity-0"
          )}
        />
      </div>

      <div className="space-y-3 border-t border-border p-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="payment-method">Payment</Label>
            <Select id="payment-method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="ONLINE">Online</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="discount">Discount (Rs)</Label>
            <Input id="discount" type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </div>
        </div>

        <div>
          <Label htmlFor="pos-notes">Order notes (optional)</Label>
          <Textarea id="pos-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={paymentStatus === "PAID"}
            onChange={(e) => setPaymentStatus(e.target.checked ? "PAID" : "UNPAID")}
            className="h-4 w-4 rounded border-border accent-brand"
          />
          Mark as paid
        </label>

        <div className="space-y-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between text-ink-soft">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discountValue > 0 && (
            <div className="flex justify-between text-ink-soft">
              <span>Discount</span>
              <span>-{formatCurrency(discountValue)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-ink">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <Button size="lg" className="w-full" onClick={handleSubmit} disabled={pending || cart.length === 0}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Place order · {formatCurrency(total)}
        </Button>
      </div>
    </div>
  );
}
