import Link from "next/link";
import { prisma } from "@/lib/db";
import { money } from "@/lib/format";
import { formatDateShort } from "@/lib/time";
import { PageHeader, EmptyState } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  const customers = await prisma.customer.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query } },
            { phone: { contains: query } },
            { email: { contains: query } },
          ],
        }
      : {},
    include: {
      appointments: { select: { start: true, status: true, price: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const rows = customers
    .map((customer) => {
      const completed = customer.appointments.filter((a) => a.status === "COMPLETED");
      const spent = completed.reduce((sum, a) => sum + a.price, 0);
      const last = customer.appointments.reduce<Date | null>(
        (latest, a) => (!latest || a.start > latest ? a.start : latest),
        null,
      );
      return { customer, visits: completed.length, spent, last };
    })
    .sort((a, b) => (b.last?.getTime() ?? 0) - (a.last?.getTime() ?? 0));

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} on file · history, notes and lifetime value`}
        action={
          <form className="flex gap-2">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Name, phone, email…"
              className="field w-52 py-2 text-[13px]"
            />
            <button type="submit" className="btn-outline btn-sm">
              Search
            </button>
          </form>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No customers yet"
          body="Every website booking creates a customer record automatically. You can also search by phone."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-white/70">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-shell/60 text-[10px] uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">Client</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Phone</th>
                <th className="px-4 py-2.5 font-medium">Visits</th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">Lifetime</th>
                <th className="px-4 py-2.5 font-medium">Last seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map(({ customer, visits, spent, last }) => (
                <tr key={customer.id} className="transition hover:bg-shell/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/customers/${customer.id}`} className="block">
                      <span className="block text-[13px] text-ink">{customer.name}</span>
                      <span className="block text-[10px] text-muted">{customer.email ?? "no email"}</span>
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 text-[12px] text-ink/70 sm:table-cell">{customer.phone}</td>
                  <td className="px-4 py-3 text-[12px] text-ink">{visits}</td>
                  <td className="hidden px-4 py-3 text-[12px] text-ink md:table-cell">{money(spent)}</td>
                  <td className="px-4 py-3 text-[11px] text-muted">
                    {last ? formatDateShort(new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(last)) : "—"}
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
