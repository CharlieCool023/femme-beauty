import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Mail,
  MessageCircle,
  PenLine,
  Phone,
  Receipt,
  User,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { money } from "@/lib/format";
import {
  durationLabel,
  formatDateTime,
  formatDateTimeLong,
  lagosDateStr,
  lagosMinutes,
} from "@/lib/time";
import { whatsappLink } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/ui";
import { RescheduleForm } from "@/components/admin/RescheduleForm";
import { NoteForm } from "@/components/admin/NoteForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { QuoteForm } from "@/components/admin/QuoteForm";
import { appointmentTitle } from "@/lib/appointments";
import {
  cancelAppointmentAction,
  confirmAppointmentAction,
  markDepositPaidAction,
  requestDepositAction,
  setAppointmentStatusAction,
} from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { service: true, customer: true, staff: true },
  });
  if (!appointment) notFound();

  const [settings, notifications, visits] = await Promise.all([
    getSettings(),
    prisma.notification.findMany({
      where: { relatedId: appointment.reference },
      orderBy: { createdAt: "desc" },
    }),
    prisma.appointment.count({
      where: { customerId: appointment.customerId, status: "COMPLETED" },
    }),
  ]);

  const pct =
    appointment.customCategory && appointment.price > 0
      ? Math.round((appointment.depositDue / appointment.price) * 100)
      : (appointment.service.depositPct ?? Number(settings.depositPct) ?? 30);
  const dateStr = lagosDateStr(appointment.start);
  const minutes = lagosMinutes(appointment.start);

  return (
    <div>
      <Link
        href="/admin/appointments"
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All appointments
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{appointment.reference}</p>
          <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">{appointment.customer.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {appointmentTitle(appointment)} · {formatDateTimeLong(appointment.start)}
          </p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <section className="rounded-xl border border-line bg-white/70">
            <div className="border-b border-line px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-medium text-ink">
                <CalendarDays className="h-4 w-4 text-rose-deep" /> Appointment
              </h2>
            </div>
            <dl className="divide-y divide-line px-4">
              {[
                ["When", formatDateTimeLong(appointment.start)],
                ["Duration", `${durationLabel(appointment.service.durationMin)} with ${appointment.staff.name}`],
                ["Price", appointment.customCategory && appointment.price === 0 ? "Quote pending" : money(appointment.price)],
                [
                  "Deposit",
                  appointment.depositDue === 0
                    ? "Not required"
                    : `${money(appointment.depositDue)} (${pct}%) · ${appointment.depositPaid ? "received" : "outstanding"}`,
                ],
                ...(appointment.paymentMethod ? [["Payment method", appointment.paymentMethod]] : []),
                ["Source", appointment.source === "WEB" ? "Website booking" : appointment.source],
                ...(appointment.customerNote ? [["Client note", appointment.customerNote]] : []),
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-6 py-3 text-sm">
                  <dt className="text-muted">{label}</dt>
                  <dd className="max-w-[65%] text-right text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {appointment.customCategory && (
            <section className="rounded-xl border border-rose-deep/30 bg-white/80">
              <div className="flex items-center justify-between gap-2 border-b border-rose-deep/15 px-4 py-3">
                <h2 className="flex items-center gap-2 text-sm font-medium text-ink">
                  <PenLine className="h-4 w-4 text-rose-deep" /> Custom request
                </h2>
                <span className="rounded-full bg-blush px-2.5 py-1 text-[10px] uppercase tracking-[0.08em] text-rose-deep">
                  {appointment.customCategory}
                </span>
              </div>
              <div className="p-4">
                {appointment.customBrief && (
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ink/80">
                    “{appointment.customBrief}”
                  </p>
                )}
                <p className="mt-2 text-[11px] text-muted">
                  Budget:{" "}
                  {appointment.customBudget ? money(appointment.customBudget) : "not given"}
                  {appointment.customQuotedAt
                    ? ` · quoted ${money(appointment.price)} on ${formatDateTime(appointment.customQuotedAt)}`
                    : " · not quoted yet"}
                </p>

                {!appointment.customQuotedAt && (
                  <div className="mt-4 rounded-lg bg-shell/70 p-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Send a quote
                    </p>
                    <QuoteForm id={appointment.id} price={appointment.price} deposit={appointment.depositDue} />
                  </div>
                )}

                {appointment.customQuotedAt && (
                  <form action={requestDepositAction} className="mt-3">
                    <input type="hidden" name="id" value={appointment.id} />
                    <button type="submit" className="btn-outline btn-sm">
                      <MessageCircle className="h-3.5 w-3.5" /> Resend quote & deposit details
                    </button>
                  </form>
                )}
              </div>
            </section>
          )}

          <section className="rounded-xl border border-line bg-white/70">
            <div className="border-b border-line px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-medium text-ink">
                <Receipt className="h-4 w-4 text-rose-deep" /> Next step
              </h2>
            </div>
            <div className="space-y-3 p-4">
              {appointment.status === "PENDING" && (
                <>
                  <p className="text-xs leading-relaxed text-muted">
                    {appointment.customCategory && appointment.price === 0
                      ? "This is a custom request. Read the brief above, send a quote, then the deposit request follows."
                      : "This is a new request. Send the deposit details to hold the slot, or confirm it outright if she's paying in the studio."}
                  </p>
                  {!(appointment.customCategory && appointment.price === 0) && (
                    <>
                      <form action={requestDepositAction}>
                        <input type="hidden" name="id" value={appointment.id} />
                        <button type="submit" className="btn-rose btn-sm">
                          <MessageCircle className="h-3.5 w-3.5" /> Request deposit
                        </button>
                      </form>
                      <div className="flex flex-wrap gap-2">
                        <form action={confirmAppointmentAction}>
                          <input type="hidden" name="id" value={appointment.id} />
                          <button type="submit" className="btn-outline btn-sm">
                            Confirm without deposit
                          </button>
                        </form>
                      </div>
                    </>
                  )}
                  <form action={cancelAppointmentAction}>
                    <input type="hidden" name="id" value={appointment.id} />
                    <ConfirmButton
                      message="Cancel this appointment and release the slot?"
                      className="btn-ghost btn-sm text-rose-deep"
                    >
                      Cancel request
                    </ConfirmButton>
                  </form>
                </>
              )}

              {appointment.status === "AWAITING_DEPOSIT" && (
                <>
                  <p className="text-xs leading-relaxed text-muted">
                    Deposit details sent. Once the transfer lands, record it here — the client gets a
                    confirmation right away.
                  </p>
                  <form action={markDepositPaidAction} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="id" value={appointment.id} />
                    <div>
                      <label htmlFor="method" className="label">
                        Method
                      </label>
                      <select id="method" name="method" className="field py-2 text-[13px]" defaultValue="TRANSFER">
                        <option value="TRANSFER">Bank transfer</option>
                        <option value="CASH">Cash</option>
                        <option value="POS">POS</option>
                      </select>
                    </div>
                    <button type="submit" className="btn-rose btn-sm">
                      Mark deposit received
                    </button>
                  </form>
                  <form action={cancelAppointmentAction}>
                    <input type="hidden" name="id" value={appointment.id} />
                    <ConfirmButton message="Cancel this appointment? The client will not be notified automatically." className="btn-ghost btn-sm text-rose-deep">
                      Cancel appointment
                    </ConfirmButton>
                  </form>
                </>
              )}

              {appointment.status === "CONFIRMED" && (
                <>
                  <p className="text-xs leading-relaxed text-muted">
                    All set. After the appointment, mark it completed (or no-show) — that&apos;s what
                    feeds your reports.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <form action={setAppointmentStatusAction}>
                      <input type="hidden" name="id" value={appointment.id} />
                      <input type="hidden" name="status" value="COMPLETED" />
                      <button type="submit" className="btn-primary btn-sm">
                        Mark completed
                      </button>
                    </form>
                    <form action={setAppointmentStatusAction}>
                      <input type="hidden" name="id" value={appointment.id} />
                      <input type="hidden" name="status" value="NO_SHOW" />
                      <button type="submit" className="btn-outline btn-sm">
                        No-show
                      </button>
                    </form>
                    <form action={cancelAppointmentAction}>
                      <input type="hidden" name="id" value={appointment.id} />
                      <ConfirmButton message="Cancel this confirmed appointment?" className="btn-ghost btn-sm text-rose-deep">
                        Cancel
                      </ConfirmButton>
                    </form>
                  </div>
                </>
              )}

              {["COMPLETED", "NO_SHOW", "CANCELLED"].includes(appointment.status) && (
                <form action={setAppointmentStatusAction}>
                  <input type="hidden" name="id" value={appointment.id} />
                  <input type="hidden" name="status" value="CONFIRMED" />
                  <button type="submit" className="btn-outline btn-sm">
                    Reopen as confirmed
                  </button>
                </form>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-line bg-white/70 p-4">
            <h2 className="text-sm font-medium text-ink">Move this appointment</h2>
            <p className="mb-3 mt-1 text-xs text-muted">
              The new time is checked against your real availability.
            </p>
            <RescheduleForm id={appointment.id} defaultDate={dateStr} defaultMinutes={minutes} />
          </section>

          <section className="rounded-xl border border-line bg-white/70 p-4">
            <h2 className="text-sm font-medium text-ink">Private note</h2>
            <p className="mb-3 mt-1 text-xs text-muted">Only you and your team see this.</p>
            <NoteForm id={appointment.id} note={appointment.internalNote} />
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-line bg-white/70 p-4">
            <h2 className="flex items-center gap-2 text-sm font-medium text-ink">
              <User className="h-4 w-4 text-rose-deep" /> Client
            </h2>
            <p className="mt-3 text-sm text-ink">{appointment.customer.name}</p>
            <p className="text-[11px] text-muted">
              {visits} completed visit{visits === 1 ? "" : "s"} ·{" "}
              <Link href={`/admin/customers/${appointment.customer.id}`} className="text-espresso underline decoration-line underline-offset-2">
                profile
              </Link>
            </p>

            <div className="mt-3 space-y-1.5 text-sm">
              <a href={`tel:${appointment.customer.phone}`} className="flex items-center gap-2 text-muted hover:text-ink">
                <Phone className="h-3.5 w-3.5" /> {appointment.customer.phone}
              </a>
              {appointment.customer.email && (
                <a href={`mailto:${appointment.customer.email}`} className="flex items-center gap-2 text-muted hover:text-ink">
                  <Mail className="h-3.5 w-3.5" /> {appointment.customer.email}
                </a>
              )}
            </div>

            <a
              href={whatsappLink(
                appointment.customer.phone,
                `Hi ${appointment.customer.name.split(" ")[0]}, it's Femme Beauty about your appointment ${appointment.reference}.`,
              )}
              target="_blank"
              rel="noreferrer"
              className="btn-rose btn-sm mt-4 w-full justify-center"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp client
            </a>

            {appointment.customer.notes && (
              <div className="mt-4 rounded-lg bg-shell p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Client notes</p>
                <p className="mt-1 text-xs leading-relaxed text-ink/80">{appointment.customer.notes}</p>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-line bg-white/70">
            <div className="border-b border-line px-4 py-3">
              <h2 className="text-sm font-medium text-ink">Messages queued</h2>
            </div>
            {notifications.length === 0 ? (
              <p className="px-4 py-4 text-xs text-muted">No messages for this booking yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {notifications.map((notification) => (
                  <li key={notification.id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted">
                        {notification.channel} · {notification.to}
                      </p>
                      <span
                        className={
                          notification.status === "SENT"
                            ? "text-[10px] text-[#3f6b45]"
                            : "text-[10px] text-rose-deep"
                        }
                      >
                        {notification.status === "SENT" ? "sent" : "queued"}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-[11px] leading-relaxed text-ink/70">
                      {notification.body}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/admin/outbox" className="block border-t border-line px-4 py-2.5 text-[11px] text-muted hover:text-espresso">
              Open outbox →
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
