import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type VariantInput = { label: string; price: number };
type ItemInput = { name: string; variants: VariantInput[]; description?: string };
type CategoryInput = { name: string; items: ItemInput[] };

const SIZE = (small: number, medium: number, large: number): VariantInput[] => [
  { label: "Small", price: small },
  { label: "Medium", price: medium },
  { label: "Large", price: large },
];

const SINGLE_FAMILY = (single: number, family: number): VariantInput[] => [
  { label: "Single", price: single },
  { label: "Family", price: family },
];

const HALF_FULL = (half: number, full: number): VariantInput[] => [
  { label: "Half", price: half },
  { label: "Full", price: full },
];

const PCS_6_12 = (six: number, twelve: number): VariantInput[] => [
  { label: "6 pcs", price: six },
  { label: "12 pcs", price: twelve },
];

const ONE = (price: number): VariantInput[] => [{ label: "Regular", price }];

const MENU: CategoryInput[] = [
  {
    name: "Chicken Gravies with Egg Rice",
    items: [
      { name: "Chicken Menchurian", variants: SIZE(650, 950, 1550) },
      { name: "Chicken Shashlik", variants: SIZE(680, 980, 1580) },
      { name: "Chicken Chilli Dry", variants: SIZE(780, 1090, 1750) },
      { name: "Black Pepper Chicken", variants: SIZE(680, 970, 1580) },
      { name: "Chicken Chilli Onion", variants: SIZE(670, 950, 1520) },
      { name: "Hot Garlic Chicken", variants: SIZE(680, 960, 1550) },
      { name: "Vegetable Chicken", variants: SIZE(700, 990, 1550) },
      { name: "Almond Chicken", variants: SIZE(750, 1070, 1700) },
      { name: "Kung Pao Chicken", variants: SIZE(750, 1070, 1700) },
      { name: "Cashewnut Chicken", variants: SIZE(780, 1090, 1750) },
      { name: "Sezchuan Chicken", variants: SIZE(700, 990, 1550) },
      { name: "Mangolian Chicken", variants: SIZE(780, 1090, 1750) },
      { name: "Basil Chicken", variants: SIZE(750, 1070, 1700) },
      { name: "Sweet & Sour Chicken", variants: SIZE(720, 1050, 1680) },
      { name: "Sesame Chicken", variants: SIZE(740, 1070, 1700) },
      { name: "Crunchy Chicken", variants: SIZE(780, 1090, 1750) },
      { name: "Red Dragon Chicken", variants: SIZE(740, 1070, 1700) },
    ],
  },
  {
    name: "Beef Gravies with Egg Fried Rice",
    items: [
      { name: "Beef Chilli Dry", variants: SIZE(870, 1250, 1850) },
      { name: "Mangolian Beef", variants: SIZE(820, 1220, 1830) },
      { name: "Basil Beef", variants: SIZE(800, 1180, 1780) },
      { name: "Crunchy Beef", variants: SIZE(850, 1250, 1850) },
      { name: "Oyster Beef", variants: SIZE(840, 1200, 1770) },
    ],
  },
  {
    name: "Combos & Deals",
    items: [
      { name: "Combo 1 — Egg Fried Rice + Kung Pao Chicken + Chicken Chowmein", variants: ONE(999) },
      { name: "Combo 2 — Egg Fried Rice + Chicken Chilli Dry + Chicken Chowmein", variants: ONE(1199) },
      {
        name: "Deal 1 — Single Chilli Dry, Chowmein, Egg Fried Rice, 6pc Dumpling, 1L Drink",
        variants: ONE(1999),
      },
      {
        name: "Deal 2 — Manchourian, Chilli Dry, Chowmein, 2 Egg Fried Rice, 6pc Wings, 6pc Dumplings, 1.5L Drink",
        variants: ONE(3899),
      },
      {
        name: "Deal 3 — Kung Pao Family, Black Pepper Family, Chowmein Family, 2 Egg Fried Rice Family, 12pc Wings, 12pc Dumplings, 1.5L Drink",
        variants: ONE(6499),
      },
    ],
  },
  {
    name: "Starters",
    items: [
      { name: "Fried Wings (6 pcs)", variants: ONE(580) },
      { name: "Spicy Wings (6 pcs)", variants: ONE(650) },
      { name: "Honey Wings (6 pcs)", variants: ONE(700) },
      { name: "Dhaka Chicken", variants: ONE(750) },
      { name: "Fish Cracker", variants: ONE(300) },
      { name: "Chicken Crispers", variants: ONE(780) },
      { name: "Dynamite Chicken", variants: ONE(800) },
      { name: "Zap Thoung Glazed Dumpling", variants: PCS_6_12(600, 1150) },
      { name: "Fried Dumpling", variants: PCS_6_12(500, 900) },
      { name: "Steam Dumpling", variants: PCS_6_12(400, 800) },
    ],
  },
  {
    name: "Soups",
    items: [
      { name: "Zap Thoung Special Soup", variants: SINGLE_FAMILY(430, 1200) },
      { name: "Hot n Sour Soup", variants: SINGLE_FAMILY(300, 920) },
      { name: "Noodle Soup", variants: SINGLE_FAMILY(350, 1000) },
      { name: "Thai Clear Soup", variants: SINGLE_FAMILY(300, 920) },
      { name: "Chicken Corn Soup", variants: SINGLE_FAMILY(280, 900) },
      { name: "Corn Chowder Soup", variants: SINGLE_FAMILY(420, 1150) },
      { name: "Cream of Chicken & Mushroom Soup", variants: SINGLE_FAMILY(400, 1120) },
    ],
  },
  {
    name: "Rice",
    items: [
      { name: "Zap Thoung Special Rice", variants: SINGLE_FAMILY(600, 820) },
      { name: "Chicken Fried Rice", variants: SINGLE_FAMILY(500, 750) },
      { name: "Chicken Masala Rice", variants: SINGLE_FAMILY(550, 780) },
      { name: "Vegetable Rice", variants: SINGLE_FAMILY(420, 620) },
      { name: "Garlic Rice", variants: SINGLE_FAMILY(400, 600) },
      { name: "Egg Fried Rice", variants: SINGLE_FAMILY(450, 650) },
    ],
  },
  {
    name: "Noodles",
    items: [
      { name: "Zap Thoung Special Chowmein", variants: SINGLE_FAMILY(750, 1250) },
      { name: "Chicken Chowmein", variants: SINGLE_FAMILY(600, 1050) },
      { name: "Vegetable Chowmein", variants: SINGLE_FAMILY(550, 950) },
    ],
  },
  {
    name: "Pasta",
    items: [
      { name: "Zap Thoung Special Pasta", variants: HALF_FULL(600, 1150) },
      { name: "Chicken Alfredo Pasta", variants: HALF_FULL(500, 950) },
    ],
  },
  {
    name: "Fries",
    items: [
      { name: "Plain Fries", variants: ONE(300) },
      { name: "Loaded Fries", variants: ONE(450) },
    ],
  },
];

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@zapthoung.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const adminName = process.env.SEED_ADMIN_NAME ?? "Admin";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });

  for (let c = 0; c < MENU.length; c++) {
    const category = MENU[c];
    const dbCategory = await prisma.category.upsert({
      where: { name: category.name },
      update: { sortOrder: c },
      create: { name: category.name, sortOrder: c },
    });

    for (let i = 0; i < category.items.length; i++) {
      const item = category.items[i];
      const existing = await prisma.menuItem.findFirst({
        where: { name: item.name, categoryId: dbCategory.id },
      });

      const menuItem = existing
        ? await prisma.menuItem.update({
            where: { id: existing.id },
            data: { sortOrder: i, description: item.description },
          })
        : await prisma.menuItem.create({
            data: {
              name: item.name,
              description: item.description,
              categoryId: dbCategory.id,
              sortOrder: i,
            },
          });

      for (let v = 0; v < item.variants.length; v++) {
        const variant = item.variants[v];
        const existingVariant = await prisma.menuItemVariant.findFirst({
          where: { menuItemId: menuItem.id, label: variant.label },
        });
        if (existingVariant) {
          await prisma.menuItemVariant.update({
            where: { id: existingVariant.id },
            data: { price: variant.price, sortOrder: v },
          });
        } else {
          await prisma.menuItemVariant.create({
            data: {
              menuItemId: menuItem.id,
              label: variant.label,
              price: variant.price,
              sortOrder: v,
            },
          });
        }
      }
    }
  }

  console.log("Seed complete.");
  console.log(`Admin login -> email: ${adminEmail}  password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
