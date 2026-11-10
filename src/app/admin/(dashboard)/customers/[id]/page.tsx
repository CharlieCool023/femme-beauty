import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { money } from "@/lib/format";
import { formatDateTime } from "@/lib/time";
import { whatsappLink } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/ui";
import { CustomerForm } from "@/components/admin/CustomerForm";
import { appointmentTitle } from "@/lib/appointments";

export const dynamic = "force-dynamic";

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      appointments: {
        include: { service: true },
        orderBy: { start: "desc" },
      },
    },
  });
  if (!customer) notFound();

  const completed = customer.appointments.filter((a) => a.status === "COMPLETED");
  const spent = completed.reduce((sum, a) => sum + a.price, 0);
  const noShows = customer.appointments.filter((a) => a.status === "NO_SHOW").length;

  return (
    <div>
      <Link href="/admin/customers" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Customers
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">{customer.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {customer.phone} · joined{" "}
            {new Intl.DateTimeFormat("en-GB", {
              timeZone: "Africa/Lagos",
              month: "long",
              year: "numeric",
            }).format(customer.createdAt)}
          </p>
        </div>
        <a
          href={whatsappLink(customer.phone, `Hi ${customer.name.split(" ")[0]}, it's Femme Beauty.`)}
          target="_blank"
          rel="noreferrer"
          className="btn-rose btn-sm"
        >
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
        </a>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-line bg-white/70 p-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Visits</p>
              <p className="mt-1 font-display text-2xl text-ink">{completed.length}</p>
            </div>
            <div className="rounded-xl border border-line bg-white/70 p-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Lifetime</p>
              <p className="mt-1 font-display text-2xl text-ink">{money(spent)}</p>
            </div>
            <div className="rounded-xl border border-line bg-white/70 p-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted">No-shows</p>
              <p className="mt-1 font-display text-2xl text-ink">{noShows}</p>
            </div>
          </div>

          <section className="overflow-hidden rounded-xl border border-line bg-white/70">
            <div className="border-b border-line px-4 py-3">
              <h2 className="text-sm font-medium text-ink">Appointment history</h2>
            </div>
            {customer.appointments.length === 0 ? (
              <p className="px-4 py-6 text-xs text-muted">No appointments yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {customer.appointments.map((appointment) => (
                  <li key={appointment.id}>
                    <Link
                      href={`/admin/appointments/${appointment.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-shell/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] text-ink">{appointmentTitle(appointment)}</p>
                        <p className="text-[10px] text-muted">{formatDateTime(appointment.start)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-[12px] text-ink/70">{money(appointment.price)}</span>
                        <StatusBadge status={appointment.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-line bg-white/70 p-4">
            <h2 className="text-sm font-medium text-ink">Contact</h2>
            <div className="mt-3 space-y-2 text-sm">
              <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-muted hover:text-ink">
                <Phone className="h-3.5 w-3.5" /> {customer.phone}
              </a>
              {customer.email && (
                <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-muted hover:text-ink">
                  <Mail className="h-3.5 w-3.5" /> {customer.email}
                </a>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-line bg-white/70 p-4">
            <h2 className="text-sm font-medium text-ink">Client card</h2>
            <p className="mb-3 mt-1 text-xs text-muted">
              Saved to every future appointment — measurements, allergies, preferences.
            </p>
            <CustomerForm
              customer={{
                id: customer.id,
                name: customer.name,
                email: customer.email,
                notes: customer.notes,
              }}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
