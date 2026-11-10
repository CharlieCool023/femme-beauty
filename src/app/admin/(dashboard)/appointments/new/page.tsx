import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { todayStr } from "@/lib/time";
import { ManualAppointmentForm } from "@/components/admin/ManualAppointmentForm";

export const dynamic = "force-dynamic";

export default async function NewAppointmentPage() {
  const [services, settings] = await Promise.all([
    prisma.service.findMany({
      where: { active: true, hidden: false },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    getSettings(),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/appointments"
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Appointments
      </Link>

      <h1 className="font-display text-3xl text-ink">Add an appointment</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        For phone bookings and walk-ins. It is checked against the same calendar as the website, so
        you can&apos;t double-book by mistake.
      </p>

      <ManualAppointmentForm
        services={services.map((service) => ({
          id: service.id,
          name: service.name,
          durationMin: service.durationMin,
          price: service.price,
          depositPct: service.depositPct,
        }))}
        today={todayStr()}
        depositPct={Number(settings.depositPct) || 30}
      />
    </div>
  );
}
