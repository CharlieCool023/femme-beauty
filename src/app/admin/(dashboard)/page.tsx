import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Inbox,
  MessageCircle,
  Package,
  PenLine,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { money } from "@/lib/format";
import {
  addDays,
  endOfDay,
  formatDateLong,
  formatTime,
  lagosMinutes,
  mondayOf,
  startOfDay,
  todayStr,
} from "@/lib/time";
import { StatusBadge, StatCard, EmptyState } from "@/components/admin/ui";
import { appointmentTitle } from "@/lib/appointments";
import { requestDepositAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  const today = todayStr();
  const dayStart = startOfDay(today);
  const dayEnd = endOfDay(today);
  const weekStart = mondayOf(today);
  const weekEnd = endOfDay(addDays(weekStart, 6));

  const [
    todayAppointments,
    pending,
    weekAgg,
    depositAgg,
    newOrders,
    recentOrders,
    queuedCount,
    recentNotifications,
    customerCount,
    soldOut,
    awaitingCount,
    pendingTotal,
  ] = await Promise.all([
    prisma.appointment.findMany({
      where: { start: { gte: dayStart, lt: dayEnd }, status: { not: "CANCELLED" } },
      include: { service: true, customer: true },
      orderBy: { start: "asc" },
    }),
    prisma.appointment.findMany({
      where: { status: "PENDING" },
      include: { service: true, customer: true },
      orderBy: { start: "asc" },
      take: 4,
    }),
    prisma.appointment.aggregate({
      where: {
        start: { gte: startOfDay(weekStart), lt: weekEnd },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      _sum: { price: true },
      _count: { _all: true },
    }),
    prisma.appointment.aggregate({
      where: { depositPaid: false, status: { in: ["PENDING", "AWAITING_DEPOSIT", "CONFIRMED"] } },
      _sum: { depositDue: true },
      _count: { _all: true },
    }),
    prisma.orderIntent.count({ where: { status: "NEW" } }),
    prisma.orderIntent.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.notification.count({ where: { status: "QUEUED" } }),
    prisma.notification.findMany({ where: { status: "QUEUED" }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.customer.count(),
    prisma.product.count({ where: { status: "SOLD_OUT", active: true } }),
    prisma.appointment.count({ where: { status: "AWAITING_DEPOSIT" } }),
    prisma.appointment.count({ where: { status: "PENDING" } }),
  ]);

  const lagosHour = (new Date().getUTCHours() + 1) % 24;
  const greeting = lagosHour < 12 ? "Good morning" : lagosHour < 17 ? "Good afternoon" : "Good evening";
  const firstName = (session?.name ?? "Syl").split(" ")[0];
  const weekRevenue = weekAgg._sum.price ?? 0;
  const depositsDue = depositAgg._sum.depositDue ?? 0;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{formatDateLong(today)}</p>
          <h1 className="mt-1.5 font-display text-3xl text-ink sm:text-4xl">
            {greeting}, {firstName}.
          </h1>
          <p className="mt-1 text-sm text-muted">
            {todayAppointments.length === 0
              ? "No appointments today — the calendar is clear."
              : `${todayAppointments.length} appointment${todayAppointments.length === 1 ? "" : "s"} on the books today.`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/calendar" className="btn-outline btn-sm">
            <CalendarDays className="h-3.5 w-3.5" /> Calendar
          </Link>
          <Link href="/admin/appointments" className="btn-primary btn-sm">
            All appointments
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Today"
          value={String(todayAppointments.length)}
          hint={todayAppointments[0] ? `First at ${formatTime(lagosMinutes(todayAppointments[0].start))}` : "Nothing booked"}
        />
        <StatCard
          label="New requests"
          value={String(pendingTotal)}
          hint="Waiting on your confirmation"
          accent={pendingTotal ? "rose" : "ink"}
        />
        <StatCard
          label="Deposits due"
          value={money(depositsDue)}
          hint={`${depositAgg._count._all} appointment${depositAgg._count._all === 1 ? "" : "s"} unpaid`}
        />
        <StatCard
          label="This week"
          value={money(weekRevenue)}
          hint={`${weekAgg._count._all} confirmed appointments`}
          accent="green"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <section className="rounded-xl border border-line bg-white/70">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-medium text-ink">
                <CalendarDays className="h-4 w-4 text-rose-deep" /> Today&apos;s schedule
              </h2>
              <Link href="/admin/calendar" className="text-[11px] text-muted hover:text-espresso">
                Open week view →
              </Link>
            </div>

            {todayAppointments.length === 0 ? (
              <div className="px-4 py-8">
                <EmptyState
                  title="A clear day"
                  body="No appointments booked for today. New requests will show up here the moment they come in."
                />
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {todayAppointments.map((appointment) => (
                  <li key={appointment.id}>
                    <Link
                      href={`/admin/appointments/${appointment.id}`}
                      className="flex items-center gap-4 px-4 py-3 transition hover:bg-shell/60"
                    >
                      <div className="w-14 shrink-0 text-right">
                        <p className="text-sm font-medium text-ink">{formatTime(lagosMinutes(appointment.start))}</p>
                        <p className="text-[10px] text-muted">{appointment.service.durationMin} min</p>
                      </div>
                      <div className="min-w-0 flex-1 border-l border-line pl-4">
                        <p className="truncate text-sm text-ink">{appointment.customer.name}</p>
                        <p className="truncate text-[11px] text-muted">
                          {appointmentTitle(appointment)} · {money(appointment.price)}
                        </p>
                      </div>
                      <StatusBadge status={appointment.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-line bg-white/70">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-medium text-ink">
                <Sparkles className="h-4 w-4 text-rose-deep" /> Needs attention
              </h2>
              <Link href="/admin/appointments?status=PENDING" className="text-[11px] text-muted hover:text-espresso">
                See all →
              </Link>
            </div>

            {pending.length === 0 ? (
              <p className="px-4 py-6 text-xs text-muted">
                Nothing waiting. Every request has been actioned — nice work.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {pending.map((appointment) => (
                  <li key={appointment.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/appointments/${appointment.id}`}
                        className="truncate text-sm text-ink hover:text-rose-deep"
                      >
                        {appointment.customer.name}
                      </Link>
                      <p className="truncate text-[11px] text-muted">
                        {appointmentTitle(appointment)} ·{" "}
                        {new Intl.DateTimeFormat("en-GB", {
                          timeZone: "Africa/Lagos",
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        }).format(appointment.start)}{" "}
                        at {formatTime(lagosMinutes(appointment.start))}
                      </p>
                    </div>
                    {appointment.customCategory && appointment.price === 0 ? (
                      <Link href={`/admin/appointments/${appointment.id}`} className="btn-outline btn-sm">
                        <PenLine className="h-3.5 w-3.5" /> Quote it
                      </Link>
                    ) : (
                      <form action={requestDepositAction}>
                        <input type="hidden" name="id" value={appointment.id} />
                        <button type="submit" className="btn-rose btn-sm">
                          <MessageCircle className="h-3.5 w-3.5" /> Request deposit
                        </button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-line bg-white/70 p-4">
            <h2 className="flex items-center gap-2 text-sm font-medium text-ink">
              <TrendingUp className="h-4 w-4 text-rose-deep" /> This week at a glance
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Confirmed value</dt>
                <dd className="text-ink">{money(weekRevenue)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Awaiting deposit</dt>
                <dd className="text-ink">{awaitingCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Customers on file</dt>
                <dd className="text-ink">{customerCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Sold-out products</dt>
                <dd className="text-ink">{soldOut}</dd>
              </div>
            </dl>
            <Link
              href="/admin/reports"
              className="mt-3 inline-flex items-center gap-1 text-[11px] text-muted hover:text-espresso"
            >
              More numbers <ArrowRight className="h-3 w-3" />
            </Link>
          </section>

          <section className="rounded-xl border border-line bg-white/70">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-medium text-ink">
                <Package className="h-4 w-4 text-rose-deep" /> Shop enquiries
              </h2>
              <span className="rounded-full bg-blush px-2 py-0.5 text-[10px] text-rose-deep">{newOrders} new</span>
            </div>
            {recentOrders.length === 0 ? (
              <p className="px-4 py-5 text-xs text-muted">No WhatsApp order enquiries yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {recentOrders.map((order) => (
                  <li key={order.id} className="px-4 py-2.5">
                    <p className="truncate text-[13px] text-ink">{order.productName}</p>
                    <p className="text-[10px] text-muted">
                      {order.variant ? `${order.variant} · ` : ""}
                      {order.amount ? money(order.amount) : "Price on request"} ·{" "}
                      {order.status.toLowerCase()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/admin/orders" className="block border-t border-line px-4 py-2.5 text-[11px] text-muted hover:text-espresso">
              Open orders →
            </Link>
          </section>

          <section className="rounded-xl border border-line bg-white/70">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-medium text-ink">
                <Inbox className="h-4 w-4 text-rose-deep" /> Outbox
              </h2>
              <span className="rounded-full bg-line/60 px-2 py-0.5 text-[10px] text-muted">{queuedCount} queued</span>
            </div>
            {recentNotifications.length === 0 ? (
              <p className="px-4 py-5 text-xs text-muted">Everything sent. Nothing waiting.</p>
            ) : (
              <ul className="divide-y divide-line">
                {recentNotifications.map((notification) => (
                  <li key={notification.id} className="px-4 py-2.5">
                    <p className="text-[11px] uppercase tracking-[0.1em] text-muted">{notification.channel}</p>
                    <p className="truncate text-[12px] text-ink">{notification.subject ?? "Message"}</p>
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
