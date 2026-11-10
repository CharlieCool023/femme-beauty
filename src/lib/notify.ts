import { prisma } from "@/lib/db";
import { formatDateTimeLong, durationLabel } from "@/lib/time";
import { money } from "@/lib/format";
import type { Settings } from "@/lib/settings";

type AppointmentForMessage = {
  reference: string;
  start: Date;
  price: number;
  depositDue: number;
  customer: { name: string; phone: string; email: string | null };
  service: { name: string; durationMin: number };
};

/** Queue an outbox entry. Delivery happens from the admin Outbox (or a provider later). */
export async function queueNotification(input: {
  channel: "WHATSAPP" | "EMAIL";
  to: string;
  subject?: string;
  body: string;
  relatedId?: string;
}) {
  return prisma.notification.create({ data: input });
}

export async function queueDepositRequest(
  appointment: AppointmentForMessage,
  settings: Settings,
  pct: number,
) {
  const when = formatDateTimeLong(appointment.start);
  const firstName = appointment.customer.name.split(" ")[0];
  const bank = `${settings.bankName} · ${settings.accountNumber} · ${settings.accountName}`;

  await prisma.notification.createMany({
    data: [
      {
        channel: "WHATSAPP",
        to: appointment.customer.phone,
        subject: "Confirm your slot",
        body: `Hi ${firstName} 💕\n\nYour Femme Beauty slot is ready to confirm:\n\n${appointment.service.name} (${durationLabel(appointment.service.durationMin)})\n${when}\nRef: ${appointment.reference}\n\nPlease send a ${money(appointment.depositDue)} deposit (${pct}%) to:\n${bank}\n\nUse your reference as the transfer narration, then reply with the receipt. Your slot is held for 48 hours.`,
        relatedId: appointment.reference,
      },
      {
        channel: "EMAIL",
        to: appointment.customer.email ?? "",
        subject: `Confirm your Femme Beauty appointment · ${appointment.reference}`,
        body: `Hi ${firstName},\n\nYour slot: ${appointment.service.name}, ${when}.\nReference: ${appointment.reference}\nDeposit: ${money(appointment.depositDue)} (${pct}%) to ${bank}.\n\nReply to this email once paid and we'll lock it in.\n\n— Femme Beauty`,
        relatedId: appointment.reference,
      },
    ].filter((n) => n.to),
  });
}

export async function queueConfirmed(
  appointment: AppointmentForMessage,
  settings: Settings,
) {
  const when = formatDateTimeLong(appointment.start);
  const firstName = appointment.customer.name.split(" ")[0];

  await prisma.notification.createMany({
    data: [
      {
        channel: "WHATSAPP",
        to: appointment.customer.phone,
        subject: "Appointment confirmed",
        body: `You're confirmed 💕\n\n${appointment.service.name}\n${when}\nRef: ${appointment.reference}\n\nFemme Beauty · ${settings.address}\nPlease arrive 5 minutes early. Need to move it? Message us at least ${settings.cancellationHours} hours before.`,
        relatedId: appointment.reference,
      },
      {
        channel: "EMAIL",
        to: appointment.customer.email ?? "",
        subject: `Confirmed · ${appointment.reference}`,
        body: `Hi ${firstName},\n\nYour ${appointment.service.name} appointment is confirmed for ${when}.\n\nAddress: ${settings.address}\nReference: ${appointment.reference}\n\nSee you soon,\nFemme Beauty`,
        relatedId: appointment.reference,
      },
    ].filter((n) => n.to),
  });
}

export async function notificationHistory(reference: string) {
  return prisma.notification.findMany({
    where: { relatedId: reference },
    orderBy: { createdAt: "desc" },
  });
}
