import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const [appointment, customer, product, service] = await Promise.all([
  prisma.appointment.findFirst({ orderBy: { createdAt: "desc" } }),
  prisma.customer.findFirst({ orderBy: { createdAt: "desc" } }),
  prisma.product.findFirst(),
  prisma.service.findFirst(),
]);

console.log(
  JSON.stringify({
    appointment: appointment?.id,
    customer: customer?.id,
    product: product?.id,
    service: service?.id,
    reference: appointment?.reference,
  }),
);

await prisma.$disconnect();
