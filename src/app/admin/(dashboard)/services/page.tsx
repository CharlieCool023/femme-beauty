import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { money } from "@/lib/format";
import { durationLabel } from "@/lib/time";
import { PageHeader } from "@/components/admin/ui";
import { archiveServiceAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const services = await prisma.service.findMany({
    orderBy: [{ active: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="Services"
        subtitle={`${services.filter((s) => s.active).length} bookable · prices and durations feed the booking engine`}
        action={
          <Link href="/admin/services/new" className="btn-primary btn-sm">
            <Plus className="h-3.5 w-3.5" /> New service
          </Link>
        }
      />

      {saved && (
        <p className="mb-3 rounded-lg border border-[#cfe3d4] bg-[#f2f8f3] px-3 py-2 text-xs text-[#3f6b45]">
          Service saved.
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-line bg-white/70">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-shell/60 text-[10px] uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Service</th>
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Category</th>
              <th className="px-4 py-2.5 font-medium">Time</th>
              <th className="px-4 py-2.5 font-medium">Price</th>
              <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Deposit</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {services.map((service) => (
              <tr key={service.id} className="transition hover:bg-shell/50">
                <td className="px-4 py-3">
                  <Link href={`/admin/services/${service.id}`} className="block">
                    <span className="block text-[13px] text-ink">{service.name}</span>
                    <span className="block text-[10px] text-muted">
                      {service.hidden
                        ? "Internal slot · never shown publicly"
                        : `${service.featured ? "Featured · " : ""}${service.active ? "bookable" : "hidden"}`}
                    </span>
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-[12px] text-ink/70 sm:table-cell">{service.category}</td>
                <td className="whitespace-nowrap px-4 py-3 text-[12px] text-ink/70">
                  {durationLabel(service.durationMin)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-[12px] text-ink">{money(service.price)}</td>
                <td className="hidden px-4 py-3 text-[12px] text-ink/70 lg:table-cell">
                  {service.depositPct !== null ? `${service.depositPct}%` : "Global"}
                </td>
                <td className="px-4 py-3">
                  <form action={archiveServiceAction}>
                    <input type="hidden" name="id" value={service.id} />
                    <input type="hidden" name="active" value={String(service.active)} />
                    <button
                      type="submit"
                      className={
                        service.active
                          ? "text-[11px] text-[#3f6b45] hover:underline"
                          : "text-[11px] text-muted hover:underline"
                      }
                    >
                      {service.active ? "Active" : "Hidden"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        Hidden services stay on old appointments but disappear from the website and booking flow.
        Deposit percentage blank means the global setting is used.
      </p>
    </div>
  );
}
