import { PrismaClient } from "@prisma/client";
import { compareSync } from "bcryptjs";

const prisma = new PrismaClient();
const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });

if (!user) {
  console.log("No admin user found.");
} else {
  const matches = compareSync(process.env.ADMIN_PASSWORD ?? "", user.passwordHash);
  console.log(`Admin: ${user.email}`);
  console.log(`Password from .env matches: ${matches}`);
}

await prisma.$disconnect();
