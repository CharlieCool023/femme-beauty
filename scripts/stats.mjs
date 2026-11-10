import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const [appointments, services, products, customers, notifications, users] = await Promise.all([
  prisma.appointment.count(),
  prisma.service.count(),
  prisma.product.count(),
  prisma.customer.count(),
  prisma.notification.count(),
  prisma.user.count(),
]);

console.log({ appointments, services, products, customers, notifications, users });
await prisma.$disconnect();
