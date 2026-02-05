// Seed: sample restaurant, categories, menu items, admin user (Prisma 7 uses adapter)
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  const restaurant = await prisma.restaurant.upsert({
    where: { id: "seed-restaurant-1" },
    update: { subdomain: "oshxona" },
    create: {
      id: "seed-restaurant-1",
      name: "Oshxona Cafe",
      subdomain: "oshxona",
    },
  });

  const cat1 = await prisma.category.upsert({
    where: { id: "seed-cat-1" },
    update: {},
    create: {
      id: "seed-cat-1",
      name: "Ichimliklar",
      restaurantId: restaurant.id,
    },
  });

  const cat2 = await prisma.category.upsert({
    where: { id: "seed-cat-2" },
    update: {},
    create: {
      id: "seed-cat-2",
      name: "Taomlar",
      restaurantId: restaurant.id,
    },
  });

  await prisma.menuItem.upsert({
    where: { id: "seed-item-1" },
    update: {},
    create: {
      id: "seed-item-1",
      name: "Choy",
      price: 5000,
      description: "Qora choy",
      categoryId: cat1.id,
      isAvailable: true,
    },
  });
  await prisma.menuItem.upsert({
    where: { id: "seed-item-2" },
    update: {},
    create: {
      id: "seed-item-2",
      name: "Kofe",
      price: 15000,
      description: "Americano",
      categoryId: cat1.id,
      isAvailable: true,
    },
  });
  await prisma.menuItem.upsert({
    where: { id: "seed-item-3" },
    update: {},
    create: {
      id: "seed-item-3",
      name: "Lag‘mon",
      price: 35000,
      description: "Qovurilgan lag‘mon",
      categoryId: cat2.id,
      isAvailable: true,
    },
  });
  await prisma.menuItem.upsert({
    where: { id: "seed-item-4" },
    update: {},
    create: {
      id: "seed-item-4",
      name: "Osh",
      price: 40000,
      description: "O‘zbek oshi",
      categoryId: cat2.id,
      isAvailable: true,
    },
  });

  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.adminUser.upsert({
    where: { email: "admin@oshxona.uz" },
    update: {},
    create: {
      email: "admin@oshxona.uz",
      passwordHash,
      restaurantId: restaurant.id,
    },
  });

  const superHash = await bcrypt.hash("super123", 10);
  await prisma.superAdmin.upsert({
    where: { email: "superadmin@qrplatform.uz" },
    update: {},
    create: {
      email: "superadmin@qrplatform.uz",
      passwordHash: superHash,
    },
  });

  console.log("Seed bajarildi. Restoran:", restaurant.name);
  console.log("Admin: admin@oshxona.uz / admin123");
  console.log("SuperAdmin: superadmin@qrplatform.uz / super123");
  console.log("Menu URL: /menu/" + restaurant.id);
  console.log("Subdomain: oshxona.qrplatform.uz (NEXT_PUBLIC_ROOT_DOMAIN=qrplatform.uz) yoki oshxona.localhost");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
