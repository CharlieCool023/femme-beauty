import Link from "next/link";
import type { Metadata } from "next";
import { Search, SlidersHorizontal } from "lucide-react";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/site/ProductCard";
import { PRODUCT_CATEGORIES, CATEGORY_BLURB } from "@/lib/content";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop wigs, hair, nails & lashes",
  description:
    "Ready-to-wear wigs, raw Vietnamese hair, custom press-on nails and lashes from Femme Beauty, Lagos. Nationwide delivery.",
};

type SearchParams = Promise<{ category?: string; q?: string; sort?: string }>;

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "new", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const category = PRODUCT_CATEGORIES.includes(params.category as never)
    ? (params.category as string)
    : undefined;
  const query = params.q?.trim() ?? "";
  const sort = SORTS.some((s) => s.value === params.sort) ? params.sort! : "featured";

  const where = {
    active: true,
    ...(category ? { category } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
            { category: { contains: query } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "price-asc"
      ? { price: "asc" as const }
      : sort === "price-desc"
        ? { price: "desc" as const }
        : sort === "new"
          ? { createdAt: "desc" as const }
          : [{ featured: "desc" as const }, { sortOrder: "asc" as const }];

  const [products, counts] = await Promise.all([
    prisma.product.findMany({ where, orderBy }),
    prisma.product.groupBy({ by: ["category"], where: { active: true }, _count: { _all: true } }),
  ]);

  const countMap = Object.fromEntries(counts.map((c) => [c.category, c._count._all]));
  const total = Object.values(countMap).reduce((sum, n) => sum + n, 0);

  return (
    <div className="shell py-12 lg:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow">The shop</p>
        <h1 className="mt-3 font-display text-5xl leading-tight text-ink sm:text-6xl">
          Pieces we&apos;d wear ourselves.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Every wig, bundle and set is chosen or made in-studio. Order any item on WhatsApp and
          we&apos;ll confirm availability, sizing and delivery with you directly.
        </p>
      </header>

      <div className="mt-9 flex flex-wrap items-center gap-2">
        <Link
          href={query ? `/shop?q=${encodeURIComponent(query)}` : "/shop"}
          className={cn(
            "rounded-full border px-4 py-2 text-xs tracking-wide transition",
            !category
              ? "border-ink bg-ink text-cream"
              : "border-line text-ink/70 hover:border-ink/40",
          )}
        >
          All {total > 0 && <span className="ml-1 opacity-60">{total}</span>}
        </Link>
        {PRODUCT_CATEGORIES.map((item) => (
          <Link
            key={item}
            href={`/shop?category=${encodeURIComponent(item)}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
            className={cn(
              "rounded-full border px-4 py-2 text-xs tracking-wide transition",
              category === item
                ? "border-ink bg-ink text-cream"
                : "border-line text-ink/70 hover:border-ink/40",
            )}
          >
            {item} {countMap[item] ? <span className="ml-1 opacity-60">{countMap[item]}</span> : null}
          </Link>
        ))}
      </div>

      <form className="mt-4 flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search wigs, bundles, lashes…"
            className="field pl-9"
            aria-label="Search products"
          />
        </label>
        {category && <input type="hidden" name="category" value={category} />}
        <div className="flex items-center gap-3">
          <label className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <select name="sort" defaultValue={sort} className="field appearance-none pl-8 pr-8">
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn-primary btn-sm">
            Apply
          </button>
        </div>
      </form>

      {category && CATEGORY_BLURB[category] && (
        <p className="mt-5 text-sm text-muted">{CATEGORY_BLURB[category]}</p>
      )}

      {products.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-line py-20 text-center">
          <p className="font-display text-2xl text-espresso">Nothing here yet.</p>
          <p className="mt-2 text-sm text-muted">
            Try another search or{" "}
            <Link href="/shop" className="underline decoration-rose/60 underline-offset-4">
              browse everything
            </Link>
            .
          </p>
        </div>
      ) : (
        <>
          <p className="mt-6 text-xs text-muted">
            {products.length} {products.length === 1 ? "piece" : "pieces"}
            {query ? ` matching “${query}”` : ""}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}

      <div className="mt-16 rounded-2xl bg-shell px-6 py-8 text-center">
        <p className="font-display text-2xl text-espresso">Not sure which length or lace?</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Message us before you order — we&apos;ll help you pick the right unit for your face, your
          budget and how you like to wear your hair.
        </p>
        <Link href="/contact" className="btn-outline btn-sm mt-5">
          Ask a question
        </Link>
      </div>
    </div>
  );
}
