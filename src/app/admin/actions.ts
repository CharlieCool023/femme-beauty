"use server";

import { compareSync } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  SESSION_COOKIE,
  createSessionToken,
  requireUser,
  sessionCookieOptions,
} from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getAvailability } from "@/lib/booking";
import { queueConfirmed, queueDepositRequest } from "@/lib/notify";
import { getSettings, settingNumber } from "@/lib/settings";
import { toUtc } from "@/lib/time";
import { slugify } from "@/lib/utils";

export type LoginState = { error?: string };
export type ActionState = { error?: string; success?: string };

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const num = (fd: FormData, key: string, fallback = 0) => {
  const value = Number(fd.get(key));
  return Number.isFinite(value) ? value : fallback;
};

function parseMinutes(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

/* ------------------------------------------------------------------ auth */

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = str(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Enter your email and password." };

  const limit = rateLimit(`login:${email}`, 8, 10 * 60_000);
  if (!limit.allowed) return { error: "Too many attempts. Try again in a few minutes." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !compareSync(password, user.passwordHash)) {
    return { error: "That email and password don't match." };
  }

  const store = await cookies();
  store.set(
    SESSION_COOKIE,
    createSessionToken({ id: user.id, email: user.email, name: user.name }),
    sessionCookieOptions(),
  );

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  redirect("/admin");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/* ----------------------------------------------------------- appointments */

async function loadAppointment(id: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { service: true, customer: true, staff: true },
  });
  if (!appointment) throw new Error("Appointment not found");
  return appointment;
}

function depositPctFor(
  service: { depositPct: number | null },
  settings: Record<string, string>,
) {
  return service.depositPct ?? settingNumber(settings, "depositPct", 30);
}

export async function requestDepositAction(formData: FormData) {
  await requireUser();
  const id = str(formData, "id");
  const [appointment, settings] = await Promise.all([loadAppointment(id), getSettings()]);

  await prisma.appointment.update({
    where: { id },
    data: { status: "AWAITING_DEPOSIT" },
  });
  const pct =
    appointment.customCategory && appointment.price > 0
      ? Math.round((appointment.depositDue / appointment.price) * 100)
      : depositPctFor(appointment.service, settings);
  await queueDepositRequest(appointment, settings, pct);

  revalidatePath("/admin");
  revalidatePath(`/admin/appointments/${id}`);
}

export async function markDepositPaidAction(formData: FormData) {
  await requireUser();
  const id = str(formData, "id");
  const [appointment, settings] = await Promise.all([loadAppointment(id), getSettings()]);

  await prisma.appointment.update({
    where: { id },
    data: {
      status: "CONFIRMED",
      depositPaid: true,
      paymentMethod: str(formData, "method") || "TRANSFER",
    },
  });
  await queueConfirmed(appointment, settings);

  revalidatePath("/admin");
  revalidatePath(`/admin/appointments/${id}`);
}

export async function confirmAppointmentAction(formData: FormData) {
  await requireUser();
  const id = str(formData, "id");
  const [appointment, settings] = await Promise.all([loadAppointment(id), getSettings()]);

  await prisma.appointment.update({ where: { id }, data: { status: "CONFIRMED" } });
  await queueConfirmed(appointment, settings);

  revalidatePath("/admin");
  revalidatePath(`/admin/appointments/${id}`);
}

export async function setAppointmentStatusAction(formData: FormData) {
  await requireUser();
  const id = str(formData, "id");
  const status = str(formData, "status");
  const allowed = ["PENDING", "AWAITING_DEPOSIT", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];
  if (!allowed.includes(status)) return;

  await prisma.appointment.update({ where: { id }, data: { status } });
  revalidatePath("/admin");
  revalidatePath(`/admin/appointments/${id}`);
}

export async function cancelAppointmentAction(formData: FormData) {
  await requireUser();
  const id = str(formData, "id");
  await prisma.appointment.update({ where: { id }, data: { status: "CANCELLED" } });
  revalidatePath("/admin");
  revalidatePath(`/admin/appointments/${id}`);
}

export async function rescheduleAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const id = str(formData, "id");
  const date = str(formData, "date");
  const minutes = num(formData, "minutes", -1);

  if (!date || minutes < 0) return { error: "Choose a new date and time." };

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { service: true },
  });
  if (!appointment) return { error: "Appointment not found." };

  try {
    const availability = await getAvailability(appointment.serviceId, date, appointment.staffId);
    if (!availability) return { error: "Could not load the calendar." };
    const slot = availability.slots.find((item) => item.minutes === minutes);
    if (!slot) return { error: "That time isn't free. Pick another slot." };

    const start = new Date(slot.iso);
    await prisma.appointment.update({
      where: { id },
      data: {
        start,
        end: new Date(start.getTime() + appointment.service.durationMin * 60_000),
      },
    });
  } catch {
    return { error: "That time isn't available. Try another slot." };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/appointments/${id}`);
  return { success: "Appointment moved." };
}

/* ------------------------------------------------- new appointment (phone/walk-in) */

export async function createAppointmentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const serviceId = str(formData, "serviceId");
  const date = str(formData, "date");
  const minutes = num(formData, "minutes", -1);
  const name = str(formData, "name");
  const phone = str(formData, "phone").replace(/\D/g, "");
  const email = str(formData, "email");
  const note = str(formData, "note");
  const depositPaid = formData.get("depositPaid") === "on";

  if (!serviceId || !date || minutes < 0) return { error: "Choose a service, date and time." };
  if (!name || name.length < 2) return { error: "Add the client's name." };
  if (phone.length < 10) return { error: "Add a valid phone number." };

  const availability = await getAvailability(serviceId, date);
  if (!availability) return { error: "That service is no longer available." };
  const slot = availability.slots.find((item) => item.minutes === minutes);
  if (!slot) return { error: "That time isn't free. Pick another slot." };

  const settings = await getSettings();
  const pct = availability.service.depositPct ?? settingNumber(settings, "depositPct", 30);
  const depositDue = Math.round((availability.service.price * pct) / 100 / 100) * 100;
  const start = new Date(slot.iso);

  const existing = await prisma.customer.findFirst({ where: { phone } });
  const customer =
    existing ??
    (await prisma.customer.create({
      data: { name, phone, email: email || null, notes: note || null },
    }));

  if (existing && (existing.name !== name || (email && existing.email !== email))) {
    await prisma.customer.update({
      where: { id: existing.id },
      data: { name, ...(email ? { email } : {}) },
    });
  }

  const appointment = await prisma.appointment.create({
    data: {
      reference: `FB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      customerId: customer.id,
      staffId: availability.staff.id,
      serviceId: availability.service.id,
      start,
      end: new Date(start.getTime() + availability.service.durationMin * 60_000),
      status: "CONFIRMED",
      price: availability.service.price,
      depositDue,
      depositPaid,
      paymentMethod: depositPaid ? "CASH" : null,
      customerNote: note || null,
      internalNote: "Added from the dashboard.",
      source: "ADMIN",
    },
    include: { service: true, customer: true },
  });

  await queueConfirmed(appointment, settings);

  revalidatePath("/admin");
  revalidatePath("/admin/appointments");
  revalidatePath("/admin/calendar");
  redirect(`/admin/appointments/${appointment.id}`);
}

/* -------------------------------------------------------- custom requests */

export async function quoteCustomRequestAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const id = str(formData, "id");
  const price = num(formData, "price", 0);
  const deposit = num(formData, "depositDue", 0);

  if (price <= 0) return { error: "Enter the quoted price." };
  if (deposit < 0 || deposit > price) return { error: "Deposit must be between 0 and the price." };

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { service: true, customer: true },
  });
  if (!appointment) return { error: "Appointment not found." };

  const settings = await getSettings();
  const pct = price > 0 ? Math.round((deposit / price) * 100) : 0;
  const title = appointment.customCategory
    ? `Custom · ${appointment.customCategory}`
    : "Custom request";

  await prisma.appointment.update({
    where: { id },
    data: {
      price,
      depositDue: deposit,
      customQuotedAt: new Date(),
      status: "AWAITING_DEPOSIT",
    },
  });

  await queueDepositRequest(
    {
      ...appointment,
      price,
      depositDue: deposit,
      service: { ...appointment.service, name: title },
    },
    settings,
    pct,
  );

  revalidatePath("/admin");
  revalidatePath(`/admin/appointments/${id}`);
  return { success: "Quote saved and the client message is queued." };
}

export async function saveNoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {  await requireUser();
  const id = str(formData, "id");
  await prisma.appointment.update({
    where: { id },
    data: { internalNote: str(formData, "internalNote") || null },
  });
  revalidatePath(`/admin/appointments/${id}`);
  return { success: "Note saved." };
}

/* --------------------------------------------------------------- services */

export async function saveServiceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const id = str(formData, "id");
  const name = str(formData, "name");

  if (!name) return { error: "Give the service a name." };
  const durationMin = num(formData, "durationMin", 0);
  const price = num(formData, "price", 0);
  if (durationMin < 15) return { error: "Duration should be at least 15 minutes." };
  if (price < 0) return { error: "Price can't be negative." };

  const depositRaw = str(formData, "depositPct");
  const depositPct = depositRaw === "" ? null : Number(depositRaw);

  const data = {
    name,
    category: str(formData, "category") || "Hair Care",
    description: str(formData, "description") || null,
    durationMin,
    bufferAfterMin: num(formData, "bufferAfterMin", 15),
    price,
    depositPct: depositPct !== null && Number.isFinite(depositPct) ? depositPct : null,
    active: formData.get("active") === "on",
    featured: formData.get("featured") === "on",
  };

  if (id) {
    await prisma.service.update({ where: { id }, data });
  } else {
    let slug = slugify(name);
    const exists = await prisma.service.findUnique({ where: { slug } });
    if (exists) slug = `${slug}-${Date.now().toString().slice(-4)}`;
    const count = await prisma.service.count();
    await prisma.service.create({ data: { ...data, slug, sortOrder: count } });
  }

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/book");
  redirect("/admin/services?saved=1");
}

export async function archiveServiceAction(formData: FormData) {
  await requireUser();
  const id = str(formData, "id");
  const active = formData.get("active") === "true";
  await prisma.service.update({ where: { id }, data: { active: !active } });
  revalidatePath("/admin/services");
  revalidatePath("/services");
}

/* --------------------------------------------------------------- products */

export async function saveProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) return { error: "Give the product a name." };

  const price = num(formData, "price", 0);
  if (price <= 0) return { error: "Price must be greater than zero." };

  const compareRaw = str(formData, "compareAt");
  const compareAt = compareRaw === "" ? null : Number(compareRaw);

  const variantLines = String(formData.get("variants") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const variants: { label: string; price: number }[] = [];
  for (const line of variantLines) {
    const [label, pricePart] = line.split("|").map((part) => part.trim());
    const variantPrice = Number(pricePart);
    if (!label || !Number.isFinite(variantPrice)) {
      return { error: `Variant "${line}" should look like: 18" | 265000` };
    }
    variants.push({ label, price: variantPrice });
  }

  const data = {
    name,
    category: str(formData, "category") || "Wigs",
    description: str(formData, "description") || null,
    price,
    compareAt: compareAt && Number.isFinite(compareAt) ? compareAt : null,
    sku: str(formData, "sku") || null,
    status: str(formData, "status") || "IN_STOCK",
    variantsJson: JSON.stringify(variants),
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
  };

  if (id) {
    await prisma.product.update({ where: { id }, data });
  } else {
    let slug = slugify(name);
    const exists = await prisma.product.findUnique({ where: { slug } });
    if (exists) slug = `${slug}-${Date.now().toString().slice(-4)}`;
    const count = await prisma.product.count();
    await prisma.product.create({ data: { ...data, slug, sortOrder: count } });
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products?saved=1");
}

export async function archiveProductAction(formData: FormData) {
  await requireUser();
  const id = str(formData, "id");
  const active = formData.get("active") === "true";
  await prisma.product.update({ where: { id }, data: { active: !active } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

/* --------------------------------------------------------------- settings */

const SETTING_KEYS = [
  "businessName",
  "legalName",
  "tagline",
  "phone",
  "phoneAlt",
  "whatsapp",
  "email",
  "instagram",
  "instagramHandle",
  "tiktok",
  "tiktokHandle",
  "address",
  "area",
  "mapsQuery",
  "depositPct",
  "holdMinutes",
  "cancellationHours",
  "bankName",
  "accountName",
  "accountNumber",
  "deliveryNote",
  "bookingNote",
  "aboutStory",
];

export async function saveSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  for (const key of SETTING_KEYS) {
    if (!formData.has(key)) continue;
    const value = String(formData.get(key) ?? "").trim();
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { success: "Settings saved." };
}

export async function saveHoursAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const staff = await prisma.staff.findFirst({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  if (!staff) return { error: "No active staff member found." };

  const rows: { staffId: string; weekday: number; startMin: number; endMin: number }[] = [];

  for (let weekday = 0; weekday < 7; weekday++) {
    if (formData.get(`closed_${weekday}`) === "on") continue;
    const open = parseMinutes(String(formData.get(`open_${weekday}`) ?? "09:00"));
    const close = parseMinutes(String(formData.get(`close_${weekday}`) ?? "19:00"));
    if (open === null || close === null || close <= open) continue;
    rows.push({ staffId: staff.id, weekday, startMin: open, endMin: close });
  }

  await prisma.$transaction([
    prisma.availability.deleteMany({ where: { staffId: staff.id } }),
    prisma.availability.createMany({ data: rows }),
  ]);

  revalidatePath("/admin/settings");
  revalidatePath("/book");
  return { success: "Opening hours updated." };
}

export async function addTimeOffAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const staff = await prisma.staff.findFirst({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  if (!staff) return { error: "No active staff member found." };

  const date = str(formData, "date");
  const startMin = parseMinutes(String(formData.get("startTime") ?? "09:00"));
  const endMin = parseMinutes(String(formData.get("endTime") ?? "19:00"));

  if (!date) return { error: "Pick a date." };
  if (startMin === null || endMin === null || endMin <= startMin)
    return { error: "End time must be after start time." };

  await prisma.timeOff.create({
    data: {
      staffId: staff.id,
      start: toUtc(date, startMin),
      end: toUtc(date, endMin),
      reason: str(formData, "reason") || null,
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/book");
  return { success: "Time off blocked." };
}

export async function removeTimeOffAction(formData: FormData) {
  await requireUser();
  await prisma.timeOff.delete({ where: { id: str(formData, "id") } });
  revalidatePath("/admin/settings");
  revalidatePath("/book");
}

/* ------------------------------------------------------- orders, outbox, CRM */

export async function updateOrderStatusAction(formData: FormData) {
  await requireUser();
  const id = str(formData, "id");
  const status = str(formData, "status");
  const allowed = ["NEW", "CONTACTED", "PAID", "DELIVERED", "CLOSED"];
  if (!allowed.includes(status)) return;
  await prisma.orderIntent.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function markNotificationSentAction(formData: FormData) {
  await requireUser();
  const id = str(formData, "id");
  await prisma.notification.update({
    where: { id },
    data: { status: "SENT", sentAt: new Date() },
  });
  revalidatePath("/admin/outbox");
  revalidatePath("/admin");
}

export async function saveCustomerNotesAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const id = str(formData, "id");
  await prisma.customer.update({
    where: { id },
    data: {
      notes: str(formData, "notes") || null,
      name: str(formData, "name") || undefined,
      email: str(formData, "email") || null,
    },
  });
  revalidatePath(`/admin/customers/${id}`);
  return { success: "Customer saved." };
}
