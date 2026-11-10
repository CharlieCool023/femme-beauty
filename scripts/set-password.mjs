import { hashSync } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const password = process.argv[2];
const email = process.argv[3] ?? process.env.ADMIN_EMAIL;

if (!password || password.length < 8) {
  console.error('Usage: node --env-file=.env scripts/set-password.mjs "new-password" [email]');
  console.error("Use at least 8 characters.");
  process.exit(1);
}

const prisma = new PrismaClient();
const user = email
  ? await prisma.user.findUnique({ where: { email } })
  : await prisma.user.findFirst();

if (!user) {
  console.error("No admin user found for", email ?? "(any)");
  process.exit(1);
}

await prisma.user.update({
  where: { id: user.id },
  data: { passwordHash: hashSync(password, 10) },
});

console.log(`Password updated for ${user.email}`);
await prisma.$disconnect();
