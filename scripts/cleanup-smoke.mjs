import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const testNames = ["Smoke Test Client", "Conflict Test", "Custom Smoke Client"];
const testCustomers = await prisma.customer.findMany({
  where: { name: { in: testNames } },
  select: { id: true },
});
const ids = testCustomers.map((customer) => customer.id);

const appointments = await prisma.appointment.findMany({
  where: { customerId: { in: ids } },
  select: { id: true, reference: true },
});
const references = appointments.map((appointment) => appointment.reference);

await prisma.notification.deleteMany({ where: { relatedId: { in: references } } });
await prisma.appointment.deleteMany({ where: { id: { in: appointments.map((a) => a.id) } } });
await prisma.customer.deleteMany({ where: { id: { in: ids } } });

// Keep the sample "new request" from expiring while the site is being demoed.
const demo = await prisma.appointment.findFirst({
  where: { internalNote: { contains: "Sample booking" }, status: "PENDING" },
});
if (demo) {
  await prisma.appointment.update({
    where: { id: demo.id },
    data: { holdExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60_000) },
  });
}

const [appointmentsLeft, customersLeft, byStatus] = await Promise.all([
  prisma.appointment.count(),
  prisma.customer.count(),
  prisma.appointment.groupBy({ by: ["status"], _count: { _all: true } }),
]);

console.log(`Removed ${appointments.length} test appointment(s).`);
console.log(`Appointments left: ${appointmentsLeft}, customers left: ${customersLeft}`);
console.log(JSON.stringify(byStatus));

await prisma.$disconnect();
