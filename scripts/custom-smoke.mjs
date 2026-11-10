import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

function lagosDateStr(date) {
  return new Date(date.getTime() + 60 * 60_000).toISOString().slice(0, 10);
}

const service = await prisma.service.findUnique({ where: { slug: "custom-request" } });
const staff = await prisma.staff.findFirst({ where: { active: true } });
if (!service || !staff) throw new Error("Custom service missing — run the seed");

const date = lagosDateStr(new Date(Date.now() + 3 * 24 * 60 * 60_000));
const availabilityRes = await fetch(
  `${BASE}/api/availability?serviceId=${service.id}&date=${date}&staffId=${staff.id}`,
);
const availability = await availabilityRes.json();
console.log("availability", availabilityRes.status, "slots:", availability.slots?.length);
if (!availability.slots?.length) process.exit(1);

const payload = {
  date,
  minutes: availability.slots[0].minutes,
  name: "Custom Smoke Client",
  phone: "08099990000",
  email: "custom-smoke@example.com",
  category: "Wig making",
  brief:
    "I want a 22 inch bone straight unit made to my measurements, 5x5 closure, and installed the same day.",
  budget: 250000,
};

const res = await fetch(`${BASE}/api/custom-request`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
const data = await res.json();
console.log("custom request", res.status, data.reference ?? data.error);

if (data.reference) {
  const page = await fetch(`${BASE}/booking/${data.reference}`).then((response) => response.text());
  console.log("confirmation mentions brief:", page.includes("bone straight unit"));
  console.log("confirmation mentions quote:", page.includes("Quote to follow"));

  const appointment = await prisma.appointment.findUnique({
    where: { reference: data.reference },
  });
  console.log("stored category:", appointment?.customCategory, "price:", appointment?.price);

  const cookie = process.env.TEST_COOKIE;
  if (cookie) {
    const admin = await fetch(`${BASE}/admin/appointments/${appointment.id}`, {
      headers: { Cookie: cookie },
    }).then((response) => response.text());
    console.log("admin shows quote form:", admin.includes("Send a quote"));
    console.log("admin shows brief:", admin.includes("bone straight unit"));
  }
}

const tomorrow = lagosDateStr(new Date(Date.now() + 24 * 60 * 60_000));
const normal = await prisma.service.findUnique({ where: { slug: "gele-tying" } });
console.log("gele service seeded:", Boolean(normal));

await prisma.$disconnect();
