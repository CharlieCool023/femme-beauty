import type { Service, Staff } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSettings, settingNumber } from "@/lib/settings";
import {
  addDays,
  formatDateTimeLong,
  formatTime,
  lagosMinutes,
  lagosWeekday,
  parseDateStr,
  startOfDay,
  endOfDay,
  toUtc,
  todayStr,
  weekdayOf,
} from "@/lib/time";
import { money } from "@/lib/format";
import { durationLabel } from "@/lib/time";
import { digitsOnly } from "@/lib/utils";

export const SLOT_STEP = 30;
export const LEAD_MINUTES = 90;
export const MAX_ADVANCE_DAYS = 60;
const DEFAULT_BUFFER = 15;

export const BLOCKING_STATUSES = ["PENDING", "AWAITING_DEPOSIT", "CONFIRMED"] as const;

export class BookingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingError";
  }
}

export type Slot = { time: string; minutes: number; iso: string };

export type AvailabilityResult = {
  service: Service;
  staff: Staff;
  slots: Slot[];
  closed: boolean;
};

/** Pending requests that were never actioned release their slot automatically. */
export async function expireStaleHolds() {
  await prisma.appointment.updateMany({
    where: {
      status: "PENDING",
      holdExpiresAt: { lt: new Date() },
    },
    data: {
      status: "CANCELLED",
      internalNote: "Hold expired automatically — no confirmation from the studio.",
    },
  });
}

async function resolveStaff(staffId?: string | null) {
  if (staffId) {
    const chosen = await prisma.staff.findFirst({ where: { id: staffId, active: true } });
    if (chosen) return chosen;
  }
  return prisma.staff.findFirst({ where: { active: true }, orderBy: { sortOrder: "asc" } });
}

export async function getAvailability(
  serviceId: string,
  dateStr: string,
  staffId?: string | null,
): Promise<AvailabilityResult | null> {
  const service = await prisma.service.findFirst({ where: { id: serviceId, active: true } });
  if (!service) return null;

  const staff = await resolveStaff(staffId);
  if (!staff) return null;

  parseDateStr(dateStr); // throws on malformed dates
  const weekday = weekdayOf(dateStr);

  const ranges = await prisma.availability.findMany({
    where: { staffId: staff.id, weekday },
    orderBy: { startMin: "asc" },
  });

  if (ranges.length === 0) {
    return { service, staff, slots: [], closed: true };
  }

  const dayStart = startOfDay(dateStr);
  const dayEnd = endOfDay(dateStr);

  const [appointments, timeOffs] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        staffId: staff.id,
        status: { in: [...BLOCKING_STATUSES] },
        start: { lt: dayEnd },
        end: { gt: dayStart },
      },
      include: { service: { select: { bufferAfterMin: true } } },
    }),
    prisma.timeOff.findMany({
      where: { staffId: staff.id, start: { lt: dayEnd }, end: { gt: dayStart } },
    }),
  ]);

  const now = Date.now();
  const busy = appointments
    .filter(
      (appt) =>
        appt.status !== "PENDING" ||
        !appt.holdExpiresAt ||
        appt.holdExpiresAt.getTime() > now,
    )
    .map((appt) => ({
      start: appt.start.getTime(),
      end: appt.end.getTime() + (appt.service?.bufferAfterMin ?? DEFAULT_BUFFER) * 60_000,
    }));

  const blockers = timeOffs.map((off) => ({
    start: off.start.getTime(),
    end: off.end.getTime(),
  }));

  const earliest = Math.max(
    now + LEAD_MINUTES * 60_000,
    toUtc(todayStr(), 0).getTime(),
  );

  const slots: Slot[] = [];
  const needed = service.durationMin + service.bufferAfterMin;

  for (const range of ranges) {
    for (let minutes = range.startMin; minutes + needed <= range.endMin; minutes += SLOT_STEP) {
      const start = toUtc(dateStr, minutes);
      const startMs = start.getTime();
      const endMs = startMs + service.durationMin * 60_000;
      const paddedEnd = endMs + service.bufferAfterMin * 60_000;

      if (startMs < earliest) continue;
      if (busy.some((b) => startMs < b.end && paddedEnd > b.start)) continue;
      if (blockers.some((b) => startMs < b.end && endMs > b.start)) continue;

      slots.push({ time: formatTime(minutes), minutes, iso: start.toISOString() });
    }
  }

  return { service, staff, slots, closed: false };
}

export async function availableDates(serviceId: string, staffId?: string | null) {
  const today = todayStr();
  const days: { date: string; open: boolean }[] = [];
  for (let i = 0; i < 30; i++) {
    const date = addDays(today, i);
    const weekday = weekdayOf(date);
    const count = await prisma.availability.count({
      where: { weekday, staff: { active: true, ...(staffId ? { id: staffId } : {}) } },
    });
    days.push({ date, open: count > 0 });
  }
  return days;
}

export function depositFor(price: number, pct: number) {
  return Math.round((price * pct) / 100 / 100) * 100;
}

export function newReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `FB-${out}`;
}

export type BookingInput = {
  serviceId: string;
  staffId?: string | null;
  date: string;
  minutes: number;
  name: string;
  phone: string;
  email?: string;
  note?: string;
};

export async function createBooking(input: BookingInput) {
  const name = input.name?.trim();
  const phone = digitsOnly(input.phone ?? "");
  const email = input.email?.trim() || null;

  if (!name || name.length < 2) throw new BookingError("Please enter your full name.");
  if (phone.length < 10 || phone.length > 14)
    throw new BookingError("Please enter a valid phone number (e.g. 0803 123 4567).");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new BookingError("That email address doesn't look right.");

  const availability = await getAvailability(input.serviceId, input.date, input.staffId);
  if (!availability) throw new BookingError("That service is no longer available.");
  if (availability.closed) throw new BookingError("We're closed on that day. Please pick another date.");

  const slot = availability.slots.find((s) => s.minutes === input.minutes);
  if (!slot) throw new BookingError("That time was just taken. Please choose another slot.");

  const settings = await getSettings();
  const pct = availability.service.depositPct ?? settingNumber(settings, "depositPct", 30);
  const deposit = depositFor(availability.service.price, pct);
  const start = new Date(slot.iso);
  const end = new Date(start.getTime() + availability.service.durationMin * 60_000);
  const holdMinutes = settingNumber(settings, "holdMinutes", 120);

  const existingCustomer = await prisma.customer.findFirst({ where: { phone } });
  const customer =
    existingCustomer ??
    (await prisma.customer.create({
      data: { name, phone, email },
    }));

  if (existingCustomer && (existingCustomer.name !== name || (email && existingCustomer.email !== email))) {
    await prisma.customer.update({
      where: { id: existingCustomer.id },
      data: { name, ...(email ? { email } : {}) },
    });
  }

  const appointment = await prisma.$transaction(async (tx) => {
    const conflict = await tx.appointment.findFirst({
      where: {
        staffId: availability.staff.id,
        status: { in: [...BLOCKING_STATUSES] },
        start: { lt: end },
        end: { gt: start },
      },
    });
    if (conflict) throw new BookingError("That slot was just booked. Please choose another time.");

    return tx.appointment.create({
      data: {
        reference: newReference(),
        customerId: customer.id,
        staffId: availability.staff.id,
        serviceId: availability.service.id,
        start,
        end,
        status: "PENDING",
        price: availability.service.price,
        depositDue: deposit,
        customerNote: input.note?.trim().slice(0, 500) || null,
        source: "WEB",
        holdExpiresAt: new Date(Date.now() + holdMinutes * 60_000),
      },
      include: { service: true, staff: true, customer: true },
    });
  });

  await notifyNewBooking(appointment, pct, settings);
  return appointment;
}

async function notifyNewBooking(
  appointment: {
    reference: string;
    start: Date;
    price: number;
    depositDue: number;
    customer: { name: string; phone: string; email: string | null };
    service: { name: string; durationMin: number };
  },
  pct: number,
  settings: Record<string, string>,
) {
  const when = formatDateTimeLong(appointment.start);
  const firstName = appointment.customer.name.split(" ")[0];

  await prisma.notification.createMany({
    data: [
      {
        channel: "WHATSAPP",
        to: settings.whatsapp,
        subject: "New booking request",
        body: `New booking request 🎀\n\n${appointment.customer.name}\n${appointment.service.name} (${durationLabel(appointment.service.durationMin)})\n${when}\nRef: ${appointment.reference}\n\nPrice ${money(appointment.price)} · deposit ${money(appointment.depositDue)} (${pct}%)\nConfirm in your dashboard.`,
        relatedId: appointment.reference,
      },
      {
        channel: "WHATSAPP",
        to: appointment.customer.phone,
        subject: "Booking received",
        body: `Hi ${firstName} 💕\n\nThank you for booking with Femme Beauty. We've received your request for ${appointment.service.name} on ${when}.\n\nRef: ${appointment.reference}\nDeposit due: ${money(appointment.depositDue)} (${pct}%)\n\nWe'll confirm on WhatsApp shortly. Reply here with any questions.`,
        relatedId: appointment.reference,
      },
      ...(appointment.customer.email
        ? [
            {
              channel: "EMAIL",
              to: appointment.customer.email,
              subject: `Booking received · ${appointment.reference}`,
              body: `Hi ${firstName},\n\nThanks for booking ${appointment.service.name} with Femme Beauty on ${when}.\n\nReference: ${appointment.reference}\nDeposit due: ${money(appointment.depositDue)}.\n\nWe'll be in touch on WhatsApp to confirm your slot.\n\n— Femme Beauty`,
              relatedId: appointment.reference,
            },
          ]
        : []),
    ],
  });
}

export type CustomRequestInput = {
  date: string;
  minutes: number;
  name: string;
  phone: string;
  email?: string;
  category: string;
  brief: string;
  budget?: number | null;
};

/**
 * A client-described appointment (wig making, gele, lashes, nails, makeup…).
 * It holds a real 90-minute slot but has no price until the studio quotes it.
 */
export async function createCustomRequest(input: CustomRequestInput) {
  const name = input.name?.trim();
  const phone = digitsOnly(input.phone ?? "");
  const email = input.email?.trim() || null;
  const category = input.category?.trim();
  const brief = input.brief?.trim();

  if (!name || name.length < 2) throw new BookingError("Please enter your full name.");
  if (phone.length < 10 || phone.length > 14)
    throw new BookingError("Please enter a valid phone number (e.g. 0803 123 4567).");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new BookingError("That email address doesn't look right.");
  if (!category) throw new BookingError("Tell us which category your request falls under.");
  if (!brief || brief.length < 10)
    throw new BookingError("Tell us a little more about what you want — at least a sentence.");

  const service = await prisma.service.findUnique({ where: { slug: "custom-request" } });
  if (!service || !service.active)
    throw new BookingError("Custom requests are unavailable right now. Please message us on WhatsApp.");

  const availability = await getAvailability(service.id, input.date);
  if (!availability) throw new BookingError("Could not load the calendar.");
  if (availability.closed)
    throw new BookingError("We're closed on that day. Please pick another date.");

  const slot = availability.slots.find((item) => item.minutes === input.minutes);
  if (!slot) throw new BookingError("That time was just taken. Please choose another slot.");

  const start = new Date(slot.iso);
  const end = new Date(start.getTime() + service.durationMin * 60_000);
  const settings = await getSettings();
  const holdMinutes = settingNumber(settings, "holdMinutes", 120);
  const budget = input.budget && input.budget > 0 ? Math.round(input.budget) : null;

  const existingCustomer = await prisma.customer.findFirst({ where: { phone } });
  const customer =
    existingCustomer ??
    (await prisma.customer.create({
      data: {
        name,
        phone,
        email,
        notes: `Custom request: ${category}`,
      },
    }));

  if (existingCustomer && (existingCustomer.name !== name || (email && existingCustomer.email !== email))) {
    await prisma.customer.update({
      where: { id: existingCustomer.id },
      data: { name, ...(email ? { email } : {}) },
    });
  }

  const appointment = await prisma.$transaction(async (tx) => {
    const conflict = await tx.appointment.findFirst({
      where: {
        staffId: availability.staff.id,
        status: { in: [...BLOCKING_STATUSES] },
        start: { lt: end },
        end: { gt: start },
      },
    });
    if (conflict) throw new BookingError("That slot was just booked. Please choose another time.");

    return tx.appointment.create({
      data: {
        reference: newReference(),
        customerId: customer.id,
        staffId: availability.staff.id,
        serviceId: service.id,
        start,
        end,
        status: "PENDING",
        price: 0,
        depositDue: 0,
        customerNote: brief.slice(0, 500),
        customCategory: category,
        customBrief: brief.slice(0, 1200),
        customBudget: budget,
        source: "WEB",
        holdExpiresAt: new Date(Date.now() + holdMinutes * 60_000),
      },
      include: { service: true, staff: true, customer: true },
    });
  });

  const when = formatDateTimeLong(start);
  const firstName = name.split(" ")[0];

  await prisma.notification.createMany({
    data: [
      {
        channel: "WHATSAPP",
        to: settings.whatsapp,
        subject: "New custom request",
        body: `New custom request 🎀\n\n${name}\n${category}\n${when}\nRef: ${appointment.reference}\n${
          budget ? `Budget: ${money(budget)}\n` : ""
        }\n“${brief.slice(0, 300)}”\n\nOpen the dashboard to quote it.`,
        relatedId: appointment.reference,
      },
      {
        channel: "WHATSAPP",
        to: phone,
        subject: "Custom request received",
        body: `Hi ${firstName} 💕\n\nThank you for telling us what you'd like. We've received your custom request (${category}) for ${when}.\n\nRef: ${appointment.reference}\n\nWe'll read the details and send a quote on WhatsApp before confirming.`,
        relatedId: appointment.reference,
      },
      ...(email
        ? [
            {
              channel: "EMAIL",
              to: email,
              subject: `Custom request received · ${appointment.reference}`,
              body: `Hi ${firstName},\n\nWe've received your custom request (${category}) for ${when}.\n\nBrief: ${brief}\n\nWe'll send a quote shortly.\n\n— Femme Beauty`,
              relatedId: appointment.reference,
            },
          ]
        : []),
    ],
  });

  return appointment;
}

export async function getAppointmentByReference(reference: string) {  return prisma.appointment.findUnique({
    where: { reference },
    include: { service: true, staff: true, customer: true },
  });
}

export async function upcomingForStaff(staffId: string) {
  const from = new Date();
  return prisma.appointment.findMany({
    where: { staffId, start: { gte: from }, status: { in: [...BLOCKING_STATUSES] } },
    include: { service: true, customer: true },
    orderBy: { start: "asc" },
    take: 5,
  });
}

export function slotFitsAvailability(
  ranges: { startMin: number; endMin: number }[],
  startMinutes: number,
  durationMin: number,
  bufferMin: number,
) {
  return ranges.some(
    (range) =>
      startMinutes >= range.startMin &&
      startMinutes + durationMin + bufferMin <= range.endMin,
  );
}

export function startMinutesOf(date: Date) {
  return lagosMinutes(date);
}

export function weekdayOfDate(date: Date) {
  return lagosWeekday(date);
}

export { toUtc };
