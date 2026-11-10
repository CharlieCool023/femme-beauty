import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { ServiceForm } from "@/components/admin/ServiceForm";

export const dynamic = "force-dynamic";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";

  const service = isNew ? null : await prisma.service.findUnique({ where: { id } });
  if (!isNew && !service) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/services" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Services
      </Link>

      <h1 className="font-display text-3xl text-ink">{isNew ? "New service" : service!.name}</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        {isNew
          ? "Anything you add here appears in the booking flow immediately."
          : "Changes apply to new bookings right away. Existing appointments keep their agreed price."}
      </p>

      <ServiceForm
        service={
          service
            ? {
                id: service.id,
                name: service.name,
                category: service.category,
                description: service.description,
                durationMin: service.durationMin,
                price: service.price,
                depositPct: service.depositPct,
                bufferAfterMin: service.bufferAfterMin,
                active: service.active,
                featured: service.featured,
              }
            : undefined
        }
      />
    </div>
  );
}
