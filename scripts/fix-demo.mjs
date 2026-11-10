import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const demo = await prisma.appointment.findFirst({
  where: { internalNote: { contains: "Sample booking" }, status: "AWAITING_DEPOSIT" },
  include: { customer: true },
});

if (demo) {
  await prisma.appointment.update({
    where: { id: demo.id },
    data: {
      status: "PENDING",
      depositPaid: false,
      holdExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60_000),
    },
  });
  console.log("Reset to a new request:", demo.reference, demo.customer.name);
} else {
  console.log("No demo appointment needed resetting.");
}

await prisma.$disconnect();
