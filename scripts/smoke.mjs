import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

function lagosDateStr(date) {
  const shifted = new Date(date.getTime() + 60 * 60_000);
  return shifted.toISOString().slice(0, 10);
}

async function main() {
  const service = await prisma.service.findUnique({ where: { slug: "frontal-wig-install" } });
  const staff = await prisma.staff.findFirst({ where: { active: true } });
  if (!service || !staff) throw new Error("Seed data missing");

  const tomorrow = new Date(Date.now() + 24 * 60 * 60_000);
  const date = lagosDateStr(tomorrow);

  const availabilityRes = await fetch(
    `${BASE}/api/availability?serviceId=${service.id}&date=${date}&staffId=${staff.id}`,
  );
  const availability = await availabilityRes.json();
  console.log("availability", availabilityRes.status, "slots:", availability.slots?.length);

  if (!availability.slots?.length) {
    console.log("No slots for", date);
    return;
  }

  const slot = availability.slots[0];
  const payload = {
    serviceId: service.id,
    staffId: staff.id,
    date,
    minutes: slot.minutes,
    name: "Smoke Test Client",
    phone: "08011112222",
    email: "smoke@example.com",
    note: "Automated test booking",
  };

  const bookRes = await fetch(`${BASE}/api/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const booked = await bookRes.json();
  console.log("book", bookRes.status, booked.reference ?? booked.error);

  const conflictRes = await fetch(`${BASE}/api/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, phone: "08033334444", name: "Conflict Test" }),
  });
  const conflict = await conflictRes.json();
  console.log("double-book", conflictRes.status, conflict.error ?? "UNEXPECTED SUCCESS");

  if (booked.reference) {
    for (const path of [`/booking/${booked.reference}`, `/api/ics/${booked.reference}`]) {
      const res = await fetch(`${BASE}${path}`);
      console.log(path, res.status, res.headers.get("content-type"));
    }
    const page = await fetch(`${BASE}/booking/${booked.reference}`).then((response) => response.text());
    console.log("confirmation page has reference:", page.includes(booked.reference));
  }

  const counts = await prisma.appointment.groupBy({ by: ["status"], _count: { _all: true } });
  console.log("appointments by status", JSON.stringify(counts));

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
