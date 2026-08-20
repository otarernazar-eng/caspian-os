import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Emptying database for fresh start...");
  await prisma.transaction.deleteMany();
  await prisma.order.deleteMany();
  await prisma.courierProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating Government Admin...");
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  await prisma.user.create({
    data: {
      phone: "+7 (000) 000-00-00",
      password: hashedPassword,
      role: "GOVERNMENT",
      name: "Government Dashboard",
    }
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
