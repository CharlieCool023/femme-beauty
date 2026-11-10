import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { money } from "@/lib/format";
import { PageHeader } from "@/components/admin/ui";
import { archiveProductAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  IN_STOCK: "In stock",
  MADE_TO_ORDER: "Made to order",
  SOLD_OUT: "Sold out",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; category?: string }>;
}) {
  const { saved, category } = await searchParams;
  const products = await prisma.product.findMany({
    where: category ? { category } : {},
    orderBy: [{ active: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  const categories = ["All", "Wigs", "Hair", "Nails", "Lashes", "Accessories"];

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.filter((p) => p.active).length} live in the shop · orders arrive via WhatsApp`}
        action={
          <Link href="/admin/products/new" className="btn-primary btn-sm">
            <Plus className="h-3.5 w-3.5" /> New product
          </Link>
        }
      />

      {saved && (
        <p className="mb-3 rounded-lg border border-[#cfe3d4] bg-[#f2f8f3] px-3 py-2 text-xs text-[#3f6b45]">
          Product saved.
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-1.5">
        {categories.map((item) => (
          <Link
            key={item}
            href={item === "All" ? "/admin/products" : `/admin/products?category=${item}`}
            className={
              (category ?? "All") === item
                ? "rounded-full border border-ink bg-ink px-3 py-1.5 text-[11px] text-cream"
                : "rounded-full border border-line bg-white/60 px-3 py-1.5 text-[11px] text-ink/70 hover:border-ink/30"
            }
          >
            {item}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-white/70">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-shell/60 text-[10px] uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Product</th>
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Category</th>
              <th className="px-4 py-2.5 font-medium">Price</th>
              <th className="hidden px-4 py-2.5 font-medium md:table-cell">Availability</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((product) => (
              <tr key={product.id} className="transition hover:bg-shell/50">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${product.id}`} className="flex items-center gap-3">
                    <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-blush">
                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] text-ink">{product.name}</span>
                      <span className="block text-[10px] text-muted">
                        {product.sku ?? product.slug}
                        {product.featured ? " · featured" : ""}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-[12px] text-ink/70 sm:table-cell">{product.category}</td>
                <td className="whitespace-nowrap px-4 py-3 text-[12px] text-ink">{money(product.price)}</td>
                <td className="hidden px-4 py-3 text-[12px] text-ink/70 md:table-cell">
                  {STATUS_LABEL[product.status] ?? product.status}
                </td>
                <td className="px-4 py-3">
                  <form action={archiveProductAction}>
                    <input type="hidden" name="id" value={product.id} />
                    <input type="hidden" name="active" value={String(product.active)} />
                    <button
                      type="submit"
                      className={
                        product.active ? "text-[11px] text-[#3f6b45] hover:underline" : "text-[11px] text-muted hover:underline"
                      }
                    >
                      {product.active ? "Live" : "Hidden"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        Marking a product &ldquo;sold out&rdquo; keeps it visible with a waitlist button — that&apos;s
        usually better than hiding it. &ldquo;Hidden&rdquo; removes it from the shop entirely.
      </p>
    </div>
  );
}
