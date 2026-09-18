import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatTile({
  label,
  value,
  icon: Icon,
  sub,
  accent = "brand",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  sub?: string;
  accent?: "brand" | "success" | "warning" | "dark";
}) {
  const accentClasses: Record<string, string> = {
    brand: "bg-brand-soft text-brand-dark",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    dark: "bg-ink text-white",
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm shadow-black/[0.02]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink-soft">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-ink">{value}</p>
          {sub && <p className="mt-1 text-xs text-ink-soft">{sub}</p>}
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", accentClasses[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
