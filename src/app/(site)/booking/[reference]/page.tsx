import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  CalendarPlus,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { getAppointmentByReference } from "@/lib/booking";
import { appointmentTitle } from "@/lib/appointments";
import { getSettings } from "@/lib/settings";
import { money } from "@/lib/format";
import {
  durationLabel,
  formatDateLong,
  formatTime,
  lagosDateStr,
  lagosMinutes,
} from "@/lib/time";
import { whatsappLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your appointment",
  robots: { index: false, follow: false },
};

type Params = Promise<{ reference: string }>;
type Search = Promise<{ new?: string }>;

const STATUS: Record<string, { title: string; body: string; tone: string }> = {
  PENDING: {
    title: "Request received",
    body: "Your slot is being held. We'll confirm on WhatsApp shortly — usually within a few hours during opening times.",
    tone: "text-espresso",
  },
  AWAITING_DEPOSIT: {
    title: "Awaiting your deposit",
    body: "Your slot is reserved. Send the deposit with your reference as the narration, then reply with the receipt and we'll confirm.",
    tone: "text-rose-deep",
  },
  CONFIRMED: {
    title: "You're confirmed",
    body: "Your seat is locked in. Come five minutes early — we can't wait to see you.",
    tone: "text-[#3f6b45]",
  },
  COMPLETED: {
    title: "Appointment completed",
    body: "Thank you for coming in. We'd love to see you again — booking takes two minutes.",
    tone: "text-espresso",
  },
  CANCELLED: {
    title: "Appointment cancelled",
    body: "This appointment is no longer holding a slot. You're welcome to book a new time whenever you're ready.",
    tone: "text-rose-deep",
  },
  NO_SHOW: {
    title: "Marked as no-show",
    body: "This appointment was missed. Message us if something happened — we'll do our best to help.",
    tone: "text-rose-deep",
  },
};

export default async function BookingConfirmationPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { reference } = await params;
  const { new: isNew } = await searchParams;

  const [appointment, settings] = await Promise.all([
    getAppointmentByReference(reference.toUpperCase()),
    getSettings(),
  ]);

  if (!appointment) notFound();

  const status = STATUS[appointment.status] ?? STATUS.PENDING;
  const dateStr = lagosDateStr(appointment.start);
  const minutes = lagosMinutes(appointment.start);

  const waMessage = `Hi Femme Beauty! I'm following up on my appointment ${appointment.reference} (${appointmentTitle(appointment)}).`;

  return (
    <div className="shell py-12 lg:py-16">
      <div className="mx-auto max-w-2xl">
        {isNew && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-[#cfe3d4] bg-[#f2f8f3] px-4 py-3 text-sm text-[#3f6b45]">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Request sent — keep this page, your reference is below.
          </div>
        )}

        <div className="text-center">
          <p className="eyebrow">Reference {appointment.reference}</p>
          <h1 className={`mt-3 font-display text-4xl leading-tight sm:text-5xl ${status.tone}`}>
            {status.title}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">{status.body}</p>
          {appointment.customCategory && appointment.status === "PENDING" && (
            <p className="mx-auto mt-2 max-w-md text-[12px] leading-relaxed text-rose-deep">
              We&apos;ll review your brief and send a quote on WhatsApp before anything is confirmed.
            </p>
          )}
        </div>

        <div className="card mt-8 overflow-hidden">
          <div className="border-b border-line bg-shell/60 px-5 py-4 sm:px-7">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
              {appointment.customCategory ? "Custom request" : "Appointment"}
            </p>
            <p className="mt-1 font-display text-2xl text-ink">{appointmentTitle(appointment)}</p>
            <p className="mt-0.5 text-xs text-muted">
              with {appointment.staff.name} · {durationLabel(appointment.service.durationMin)}
            </p>
          </div>

          <dl className="divide-y divide-line px-5 sm:px-7">
            {[
              { label: "Date", value: formatDateLong(dateStr) },
              { label: "Time", value: formatTime(minutes) },
              { label: "Name", value: appointment.customer.name },
              { label: "Phone", value: appointment.customer.phone },
              {
                label: "Price",
                value:
                  appointment.customCategory && appointment.price === 0
                    ? "Quote to follow"
                    : money(appointment.price),
              },
              {
                label: "Deposit",
                value:
                  appointment.customCategory && appointment.price === 0
                    ? "Requested after your quote"
                    : appointment.depositDue === 0
                      ? "Not required"
                      : `${money(appointment.depositDue)} · ${appointment.depositPaid ? "paid" : "due"}`,
              },
              ...(appointment.customerNote
                ? [{ label: "Your notes", value: appointment.customerNote }]
                : []),
            ].map((row) => (
              <div key={row.label} className="flex justify-between gap-6 py-3 text-sm">
                <dt className="text-muted">{row.label}</dt>
                <dd className="max-w-[65%] text-right text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>

          {appointment.customBrief && (
            <div className="border-t border-line px-5 py-4 sm:px-7">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Your brief</p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">
                {appointment.customBrief}
              </p>
            </div>
          )}

          {!appointment.depositPaid &&
            appointment.depositDue > 0 &&
            ["PENDING", "AWAITING_DEPOSIT"].includes(appointment.status) && (
              <div className="border-t border-line bg-rose-deep/[0.04] px-5 py-5 sm:px-7">
                <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-rose-deep">
                  <ShieldCheck className="h-3.5 w-3.5" /> Deposit details
                </p>
                <p className="mt-2 text-sm text-ink">
                  {money(appointment.depositDue)} to {settings.bankName}
                </p>
                <p className="text-sm text-muted">
                  {settings.accountNumber} · {settings.accountName}
                </p>
                <p className="mt-2 text-[11px] text-muted">
                  Use <strong className="text-espresso">{appointment.reference}</strong> as the
                  transfer narration, then send the receipt on WhatsApp.
                </p>
              </div>
            )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a
            href={`/api/ics/${appointment.reference}`}
            className="btn-outline justify-center"
            download
          >
            <CalendarPlus className="h-4 w-4" /> Add to calendar
          </a>
          <a
            href={whatsappLink(settings.whatsapp, waMessage)}
            target="_blank"
            rel="noreferrer"
            className="btn-rose justify-center"
          >
            <MessageCircle className="h-4 w-4" /> Message the studio
          </a>
        </div>

        <div className="mt-8 grid gap-4 rounded-2xl bg-shell p-5 text-xs leading-relaxed text-muted sm:grid-cols-3">
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-deep" />
            {settings.address}
          </p>
          <p className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-rose-deep" />
            Need to move it? Give us {settings.cancellationHours} hours&apos; notice.
          </p>
          <p className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-rose-deep" />
            <Link href="/policies/cancellation" className="underline underline-offset-2">
              Read the booking policy
            </Link>
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/book" className="link-underline text-espresso">
            Book another appointment
          </Link>
          <Link href="/shop" className="link-underline text-espresso">
            Shop the collection
          </Link>
        </div>
      </div>
    </div>
  );
}
