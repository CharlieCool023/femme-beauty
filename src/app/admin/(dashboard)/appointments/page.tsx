import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { money } from "@/lib/format";
import { formatDateTime, formatTime, lagosMinutes } from "@/lib/time";
import { StatusBadge, EmptyState } from "@/components/admin/ui";
import { appointmentTitle } from "@/lib/appointments";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TABS = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "New" },
  { value: "AWAITING_DEPOSIT", label: "Deposit due" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "NO_SHOW", label: "No-show" },
  { value: "CANCELLED", label: "Cancelled" },
];

type Search = Promise<{ status?: string; q?: string }>;

export default async function AppointmentsPage({ searchParams }: { searchParams: Search }) {
  const { status = "ALL", q = "" } = await searchParams;
  const query = q.trim();

  const where = {
    ...(status !== "ALL" ? { status } : {}),
    ...(query
      ? {
          OR: [
            { reference: { contains: query.toUpperCase() } },
            { customer: { name: { contains: query } } },
            { customer: { phone: { contains: query } } },
            { service: { name: { contains: query } } },
          ],
        }
      : {}),
  };

  const [appointments, counts] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: { service: true, customer: true },
      orderBy: { start: "desc" },
      take: 100,
    }),
    prisma.appointment.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countMap = Object.fromEntries(counts.map((row) => [row.status, row._count._all]));
  const total = Object.values(countMap).reduce((sum, value) => sum + value, 0);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">Appointments</h1>
          <p className="mt-1 text-sm text-muted">{total} on record · newest first</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form className="flex gap-2">
            <input type="hidden" name="status" value={status} />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search name, phone, ref…"
              className="field w-52 py-2 text-[13px]"
            />
            <button type="submit" className="btn-outline btn-sm">
              Search
            </button>
          </form>
          <Link href="/admin/appointments/new" className="btn-primary btn-sm">
            <Plus className="h-3.5 w-3.5" /> Add
          </Link>
        </div>
      </div>

      <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const count = tab.value === "ALL" ? total : (countMap[tab.value] ?? 0);
          const active = status === tab.value;
          return (
            <Link
              key={tab.value}
              href={`/admin/appointments?status=${tab.value}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-[11px] transition",
                active
                  ? "border-ink bg-ink text-cream"
                  : "border-line bg-white/60 text-ink/70 hover:border-ink/30",
              )}
            >
              {tab.label} <span className="opacity-60">{count}</span>
            </Link>
          );
        })}
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          title="Nothing here"
          body="No appointments match this filter. Try another tab or clear the search."
          action={
            <Link href="/admin/appointments" className="btn-outline btn-sm">
              Clear filters
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-white/70">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-shell/60 text-[10px] uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">When</th>
                <th className="px-4 py-2.5 font-medium">Client</th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">Service</th>
                <th className="px-4 py-2.5 font-medium">Price</th>
                <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Deposit</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="transition hover:bg-shell/50">
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link href={`/admin/appointments/${appointment.id}`} className="block">
                      <span className="block text-[13px] text-ink">{formatDateTime(appointment.start)}</span>
                      <span className="block text-[10px] text-muted">
                        {formatTime(lagosMinutes(appointment.start))} ·{" "}
                        {appointment.service.durationMin} min
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/appointments/${appointment.id}`} className="block">
                      <span className="block text-[13px] text-ink">{appointment.customer.name}</span>
                      <span className="block text-[10px] text-muted">{appointment.customer.phone}</span>
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className="block text-[12px] text-ink/80">{appointmentTitle(appointment)}</span>
                    <span className="block text-[10px] text-muted">{appointment.reference}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[12px] text-ink">
                    {appointment.customCategory && appointment.price === 0
                      ? "Quote pending"
                      : money(appointment.price)}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {appointment.depositDue === 0 ? (
                      <span className="text-[11px] text-muted">—</span>
                    ) : appointment.depositPaid ? (
                      <span className="text-[11px] text-[#3f6b45]">Paid</span>
                    ) : (
                      <span className="text-[11px] text-rose-deep">{money(appointment.depositDue)} due</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={appointment.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
