import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";

  const product = isNew
    ? null
    : await prisma.product.findUnique({
        where: { id },
        include: {
          images: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
        },
      });
  if (!isNew && !product) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Products
      </Link>

      <h1 className="font-display text-3xl text-ink">{isNew ? "New product" : product!.name}</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Price and availability show on the website instantly. Variants become selectable options on
        the product page.
      </p>

      <ProductForm
        product={
          product
            ? {
                id: product.id,
                name: product.name,
                category: product.category,
                description: product.description,
                price: product.price,
                compareAt: product.compareAt,
                sku: product.sku,
                status: product.status,
                variantsJson: product.variantsJson,
                featured: product.featured,
                active: product.active,
                images: product.images.map((image) => ({
                  mediaId: image.mediaId,
                  url: `/api/media/${image.mediaId}`,
                  alt: image.alt,
                })),
              }
            : undefined
        }
      />
    </div>
  );
}
