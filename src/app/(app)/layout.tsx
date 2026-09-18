import { getSession } from "@/lib/auth";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Toaster } from "sonner";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col bg-ink md:flex">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-base font-bold text-white">
            饮
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Zap Thoung</p>
            <p className="text-xs text-white/40">POS Console</p>
          </div>
        </div>
        <SidebarNav />
        <div className="border-t border-white/10 px-3 py-4">
          {session && (
            <div className="mb-2 px-3 text-xs text-white/40">
              <p className="font-medium text-white/70">{session.name}</p>
              <p>{session.role === "ADMIN" ? "Administrator" : "Staff"}</p>
            </div>
          )}
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
              饮
            </div>
            <p className="text-sm font-semibold text-ink">Zap Thoung POS</p>
          </div>
        </header>
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <MobileNav />
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
