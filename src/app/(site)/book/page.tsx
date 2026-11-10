import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { BookingFlow } from "@/components/site/BookingFlow";
import { CUSTOM_CATEGORIES } from "@/lib/content";
import { addDays, todayStr, weekdayOf } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book an appointment",
  description:
    "Book a wig install, braids, manicure or lash set at Femme Beauty, Fadeyi, Lagos. Real availability, confirmations on WhatsApp.",
};

type SearchParams = Promise<{ service?: string; mode?: string }>;

export default async function BookPage({ searchParams }: { searchParams: SearchParams }) {
  const { service: serviceSlug, mode } = await searchParams;

  const [services, settings, staff, customService] = await Promise.all([
    prisma.service.findMany({
      where: { active: true, hidden: false },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    getSettings(),
    prisma.staff.findFirst({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.service.findUnique({ where: { slug: "custom-request" } }),
  ]);

  const availability = staff
    ? await prisma.availability.findMany({ where: { staffId: staff.id } })
    : [];
  const openWeekdays = new Set(availability.map((a) => a.weekday));

  const today = todayStr();
  const days = Array.from({ length: 30 }).map((_, index) => {
    const date = addDays(today, index);
    return { date, open: openWeekdays.has(weekdayOf(date)) };
  });

  const initial = services.find((s) => s.slug === serviceSlug) ?? null;

  return (
    <div className="shell py-12 lg:py-16">
      <header className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Appointments</p>
        <h1 className="mt-3 font-display text-5xl leading-tight text-ink sm:text-6xl">
          Pick a time. We&apos;ll handle the rest.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Real availability, live from the studio calendar. A {settings.depositPct}% deposit confirms
          a listed service; custom requests are quoted first and nothing is charged until you approve.
        </p>
      </header>

      <div className="mt-10 lg:mt-14">
        <BookingFlow
          services={services.map((service) => ({
            id: service.id,
            slug: service.slug,
            name: service.name,
            category: service.category,
            description: service.description,
            durationMin: service.durationMin,
            price: service.price,
            depositPct: service.depositPct,
          }))}
          customService={{
            id: customService?.id ?? "",
            name: "Custom request",
            durationMin: customService?.durationMin ?? 90,
          }}
          customCategories={[...CUSTOM_CATEGORIES]}
          initialMode={mode === "custom" ? "custom" : "service"}
          days={days}
          initialServiceId={initial?.id ?? null}
          staffId={staff?.id ?? null}
          staffName={staff?.name ?? "the studio"}
          depositPct={Number(settings.depositPct) || 30}
          holdMinutes={Number(settings.holdMinutes) || 120}
          whatsapp={settings.whatsapp}
          address={settings.address}
        />
      </div>
    </div>
  );
}
