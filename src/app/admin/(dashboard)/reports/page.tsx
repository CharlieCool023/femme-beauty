import { prisma } from "@/lib/db";
import { money } from "@/lib/format";
import { addDays, startOfDay, endOfDay, todayStr, weekdayOf, WEEKDAY_NAMES } from "@/lib/time";
import { PageHeader, StatCard } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const today = todayStr();
  const from = addDays(today, -29);
  const fromDate = startOfDay(from);
  const toDate = endOfDay(today);

  const [completed, allRecent, newCustomers, topServices] = await Promise.all([
    prisma.appointment.findMany({
      where: { start: { gte: fromDate, lt: toDate }, status: "COMPLETED" },
      include: { service: true },
    }),
    prisma.appointment.findMany({
      where: { start: { gte: fromDate, lt: toDate } },
      select: { status: true, start: true },
    }),
    prisma.customer.count({ where: { createdAt: { gte: fromDate } } }),
    prisma.appointment.groupBy({
      by: ["serviceId"],
      where: { start: { gte: fromDate, lt: toDate }, status: "COMPLETED" },
      _sum: { price: true },
      _count: { _all: true },
      orderBy: { _sum: { price: "desc" } },
      take: 6,
    }),
  ]);

  const services = await prisma.service.findMany({
    where: { id: { in: topServices.map((row) => row.serviceId) } },
    select: { id: true, name: true },
  });
  const serviceNames = Object.fromEntries(services.map((service) => [service.id, service.name]));

  const revenue = completed.reduce((sum, appointment) => sum + appointment.price, 0);
  const average = completed.length ? Math.round(revenue / completed.length) : 0;
  const noShows = allRecent.filter((a) => a.status === "NO_SHOW").length;
  const totalPast = allRecent.filter((a) => a.start < new Date() && a.status !== "CANCELLED").length;
  const noShowRate = totalPast ? Math.round((noShows / totalPast) * 100) : 0;

  const byWeekday = Array.from({ length: 7 }).map((_, weekday) => {
    const count = completed.filter((a) => weekdayOf(new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(a.start)) === weekday).length;
    return { weekday, count };
  });
  const maxDay = Math.max(1, ...byWeekday.map((d) => d.count));

  const maxService = Math.max(1, ...topServices.map((row) => row._sum.price ?? 0));

  return (
    <div>
      <PageHeader title="Reports" subtitle="Last 30 days — what's working, what to watch." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Completed revenue" value={money(revenue)} hint={`${completed.length} appointments`} accent="green" />
        <StatCard label="Average ticket" value={money(average)} hint="Per completed appointment" />
        <StatCard label="New customers" value={String(newCustomers)} hint="First booking in 30 days" />
        <StatCard label="No-show rate" value={`${noShowRate}%`} hint={`${noShows} missed`} accent={noShowRate > 10 ? "rose" : "ink"} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-white/70 p-4">
          <h2 className="text-sm font-medium text-ink">Top services by revenue</h2>
          {topServices.length === 0 ? (
            <p className="mt-3 text-xs text-muted">No completed appointments in this window yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {topServices.map((row) => (
                <li key={row.serviceId}>
                  <div className="flex items-baseline justify-between gap-3 text-[12px]">
                    <span className="truncate text-ink">{serviceNames[row.serviceId] ?? "Service"}</span>
                    <span className="shrink-0 text-ink/70">
                      {money(row._sum.price ?? 0)} · {row._count._all}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line/60">
                    <div
                      className="h-full rounded-full bg-rose-deep"
                      style={{ width: `${Math.round(((row._sum.price ?? 0) / maxService) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-line bg-white/70 p-4">
          <h2 className="text-sm font-medium text-ink">Busiest days</h2>
          <p className="mt-1 text-[10px] text-muted">Completed appointments by weekday</p>
          <div className="mt-4 flex h-32 items-end gap-2">
            {byWeekday.map((day) => (
              <div key={day.weekday} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t bg-rose-light"
                  style={{ height: `${Math.max(4, (day.count / maxDay) * 100)}%` }}
                  title={`${day.count} appointments`}
                />
                <span className="text-[9px] uppercase tracking-wide text-muted">
                  {WEEKDAY_NAMES[day.weekday].slice(0, 3)}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-muted">
            Use this to decide when to open extra hours — and when a quiet day needs a promotion.
          </p>
        </section>
      </div>

      <p className="mt-5 text-[11px] leading-relaxed text-muted">
        Revenue counts completed appointments only, at the price agreed when the booking was made.
        Product sales happen over WhatsApp, so they&apos;re tracked in Orders rather than here.
      </p>
    </div>
  );
}
