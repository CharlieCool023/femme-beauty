import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import {
  addDays,
  endOfDay,
  formatDateShort,
  formatDayMonth,
  formatTime,
  lagosDateStr,
  lagosMinutes,
  mondayOf,
  startOfDay,
  todayStr,
} from "@/lib/time";
import { StatusBadge } from "@/components/admin/ui";
import { appointmentTitle } from "@/lib/appointments";

export const dynamic = "force-dynamic";

const OPEN_MIN = 9 * 60;
const CLOSE_MIN = 19 * 60;
const PX_PER_MIN = 1;

type Search = Promise<{ week?: string }>;

export default async function CalendarPage({ searchParams }: { searchParams: Search }) {
  const { week } = await searchParams;
  const anchor = week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? week : todayStr();
  const weekStart = mondayOf(anchor);
  const days = Array.from({ length: 7 }).map((_, index) => addDays(weekStart, index));

  const appointments = await prisma.appointment.findMany({
    where: {
      start: { gte: startOfDay(weekStart), lt: endOfDay(addDays(weekStart, 6)) },
      status: { not: "CANCELLED" },
    },
    include: { service: true, customer: true },
    orderBy: { start: "asc" },
  });

  const byDay = new Map<string, typeof appointments>();
  for (const appointment of appointments) {
    const key = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(appointment.start);
    const list = byDay.get(key) ?? [];
    list.push(appointment);
    byDay.set(key, list);
  }

  const hours = Array.from({ length: (CLOSE_MIN - OPEN_MIN) / 60 + 1 }).map(
    (_, index) => OPEN_MIN + index * 60,
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">Calendar</h1>
          <p className="mt-1 text-sm text-muted">
            Week of {formatDateShort(weekStart)} · {appointments.length} appointment
            {appointments.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/calendar?week=${addDays(weekStart, -7)}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white/70 hover:border-ink/30"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <Link href="/admin/calendar" className="btn-outline btn-sm">
            This week
          </Link>
          <Link
            href={`/admin/calendar?week=${addDays(weekStart, 7)}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white/70 hover:border-ink/30"
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-white/70">
        <div className="min-w-[820px]">
          <div className="grid grid-cols-[52px_repeat(7,1fr)] border-b border-line">
            <div className="border-r border-line px-2 py-2 text-[9px] uppercase tracking-[0.12em] text-muted">
              WAT
            </div>
            {days.map((day) => {
              const isToday = day === todayStr();
              const count = byDay.get(day)?.length ?? 0;
              return (
                <div
                  key={day}
                  className={`border-r border-line px-2 py-2 text-center last:border-r-0 ${
                    isToday ? "bg-blush/40" : ""
                  }`}
                >
                  <p className="text-[9px] uppercase tracking-[0.14em] text-muted">
                    {formatDateShort(day).split(",")[0]}
                  </p>
                  <p className={`font-display text-lg leading-tight ${isToday ? "text-rose-deep" : "text-ink"}`}>
                    {formatDayMonth(day)}
                  </p>
                  <p className="text-[9px] text-muted">{count ? `${count} booked` : "—"}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-[52px_repeat(7,1fr)]">
            <div className="relative border-r border-line" style={{ height: (CLOSE_MIN - OPEN_MIN) * PX_PER_MIN }}>
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="absolute right-2 -translate-y-1/2 text-[10px] text-muted"
                  style={{ top: (hour - OPEN_MIN) * PX_PER_MIN }}
                >
                  {formatTime(hour)}
                </div>
              ))}
            </div>

            {days.map((day) => {
              const list = byDay.get(day) ?? [];
              const isToday = day === todayStr();
              return (
                <div
                  key={day}
                  className={`relative border-r border-line last:border-r-0 ${isToday ? "bg-blush/20" : ""}`}
                  style={{
                    height: (CLOSE_MIN - OPEN_MIN) * PX_PER_MIN,
                    backgroundImage:
                      "repeating-linear-gradient(to bottom, transparent 0, transparent 59px, #efe3dc 59px, #efe3dc 60px)",
                  }}
                >
                  {list.map((appointment) => {
                    const startMin = lagosMinutes(appointment.start);
                    const top = Math.max(0, (startMin - OPEN_MIN) * PX_PER_MIN);
                    const height = Math.max(26, appointment.service.durationMin * PX_PER_MIN - 2);
                    return (
                      <Link
                        key={appointment.id}
                        href={`/admin/appointments/${appointment.id}`}
                        className={`absolute left-1 right-1 overflow-hidden rounded-md border-l-2 px-1.5 py-1 text-[10px] leading-tight shadow-sm transition hover:z-10 hover:shadow-md ${
                          appointment.status === "PENDING"
                            ? "border-[#b98a1f] bg-[#fdf3dd] text-[#6e5310]"
                            : appointment.status === "AWAITING_DEPOSIT"
                              ? "border-rose-deep bg-blush text-rose-deep"
                              : appointment.status === "CONFIRMED"
                                ? "border-[#3f6b45] bg-[#e8f2e9] text-[#2f5234]"
                                : appointment.status === "COMPLETED"
                                  ? "border-[#4c5a63] bg-[#eef0f2] text-[#3c474e]"
                                  : "border-[#a03f31] bg-[#fbe4e0] text-[#7d2f24]"
                        }`}
                        style={{ top, height }}
                      >
                        <span className="block font-medium">{formatTime(startMin)}</span>
                        <span className="block truncate">{appointment.customer.name}</span>
                        <span className="block truncate opacity-75">{appointmentTitle(appointment)}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#fdf3dd] ring-1 ring-[#b98a1f]" /> New request
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-blush ring-1 ring-rose-deep" /> Awaiting deposit
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#e8f2e9] ring-1 ring-[#3f6b45]" /> Confirmed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#eef0f2] ring-1 ring-[#4c5a63]" /> Completed
        </span>
        <Link href="/admin/settings#hours" className="ml-auto text-espresso hover:text-rose-deep">
          Edit opening hours →
        </Link>
      </div>

      <div className="mt-6 lg:hidden">
        <h2 className="text-[11px] uppercase tracking-[0.16em] text-muted">This week&apos;s list</h2>
        <ul className="mt-2 divide-y divide-line rounded-xl border border-line bg-white/70">
          {appointments.map((appointment) => (
            <li key={appointment.id}>
              <Link
                href={`/admin/appointments/${appointment.id}`}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div className="w-16 shrink-0">
                  <p className="text-[11px] text-muted">{formatDayMonth(lagosDateStr(appointment.start))}</p>
                  <p className="text-sm text-ink">{formatTime(lagosMinutes(appointment.start))}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{appointment.customer.name}</p>
                  <p className="truncate text-[11px] text-muted">{appointmentTitle(appointment)}</p>
                </div>
                <StatusBadge status={appointment.status} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
