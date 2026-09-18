import { prisma } from "@/lib/prisma";
import { MenuManager } from "@/components/menu/menu-manager";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      menuItems: {
        orderBy: { sortOrder: "asc" },
        include: { variants: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Menu Management</h1>
        <p className="text-sm text-ink-soft">Manage categories, items, and pricing variants.</p>
      </div>
      <MenuManager categories={categories} />
    </div>
  );
}
