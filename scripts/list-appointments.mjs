import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const appointments = await prisma.appointment.findMany({
  include: { customer: true, service: true },
  orderBy: { createdAt: "asc" },
});

for (const appointment of appointments) {
  console.log(
    [
      appointment.reference,
      appointment.customer.name,
      appointment.status,
      appointment.service.slug,
      appointment.price,
      appointment.customCategory ?? "-",
      appointment.internalNote ?? "-",
    ].join(" | "),
  );
}

await prisma.$disconnect();
