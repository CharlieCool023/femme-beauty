import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Clock, Info } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { money } from "@/lib/format";
import { durationLabel } from "@/lib/time";
import { SERVICE_BLURB } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services & prices",
  description:
    "Wig installs, custom wig making, braids, hair treatments, gel nails and lash extensions at Femme Beauty, Fadeyi, Lagos. Prices and appointment times listed.",
};

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([
    prisma.service.findMany({ where: { active: true, hidden: false }, orderBy: { sortOrder: "asc" } }),
    getSettings(),
  ]);

  const grouped = new Map<string, typeof services>();
  for (const service of services) {
    const list = grouped.get(service.category) ?? [];
    list.push(service);
    grouped.set(service.category, list);
  }

  return (
    <div>
      <header className="border-b border-line bg-shell/60">
        <div className="shell py-14 lg:py-20">
          <p className="eyebrow">Services & pricing</p>
          <h1 className="mt-3 max-w-2xl text-balance font-display text-5xl leading-[1.02] text-ink sm:text-6xl">
            Everything on the menu, priced honestly.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted">
            Each appointment includes the full time it takes to do it properly — no double-booking,
            no rushing. A {settings.depositPct}% deposit confirms your seat and comes off the final
            bill.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/book" className="btn-rose w-full sm:w-auto">
              Book an appointment
            </Link>
            <Link href="/book?mode=custom" className="btn-outline w-full sm:w-auto">
              Request something custom
            </Link>
            <Link href="/policies/cancellation" className="btn-ghost w-full sm:w-auto">
              How deposits work
            </Link>
          </div>
        </div>
      </header>

      <div className="shell py-14">
        {Array.from(grouped.entries()).map(([category, items]) => (
          <section key={category} className="grid gap-6 border-b border-line py-10 first:pt-0 lg:grid-cols-[0.9fr_1.6fr] lg:gap-14">
            <div>
              <h2 className="font-display text-3xl text-ink">{category}</h2>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
                {SERVICE_BLURB[category]}
              </p>
            </div>

            <ul className="divide-y divide-line">
              {items.map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/book?service=${service.slug}`}
                    className="group flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 font-display text-xl text-ink group-hover:text-rose-deep">
                        {service.name}
                        {service.featured && (
                          <span className="rounded-full bg-blush px-2 py-0.5 text-[8px] uppercase tracking-[0.14em] text-rose-deep">
                            Popular
                          </span>
                        )}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
                        <Clock className="h-3 w-3" /> {durationLabel(service.durationMin)}
                        {service.description ? <span className="hidden sm:inline">· {service.description}</span> : null}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-4">
                      <span className="text-sm text-espresso">{money(service.price)}</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink transition group-hover:border-rose-deep group-hover:bg-rose-deep group-hover:text-white">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <div className="mt-12 grid gap-5 rounded-2xl bg-shell p-6 sm:grid-cols-3">
          <div>
            <Info className="mb-2 h-4 w-4 text-rose-deep" />
            <p className="text-sm font-medium text-espresso">Deposit & balance</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {settings.depositPct}% to book (50% for custom builds), balance in the studio. Card,
              transfer or cash.
            </p>
          </div>
          <div>
            <Clock className="mb-2 h-4 w-4 text-rose-deep" />
            <p className="text-sm font-medium text-espresso">Running late?</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              15 minutes&apos; grace. After that we may need to shorten or move the appointment to
              protect the next client.
            </p>
          </div>
          <div>
            <Info className="mb-2 h-4 w-4 text-rose-deep" />
            <p className="text-sm font-medium text-espresso">Bring your own hair?</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Absolutely. Book the install and bring your unit — we&apos;ll check the lace before we
              start.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
