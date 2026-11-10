import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { ProductArt } from "@/components/site/ProductArt";
import { OrderPanel } from "@/components/site/OrderPanel";
import { ProductCard } from "@/components/site/ProductCard";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description ?? undefined,
    openGraph: { title: product.name, description: product.description ?? undefined },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    prisma.product.findFirst({ where: { slug, active: true } }),
    getSettings(),
  ]);

  if (!product) notFound();

  let variants: { label: string; price: number }[] = [];
  try {
    const parsed = JSON.parse(product.variantsJson);
    if (Array.isArray(parsed)) variants = parsed;
  } catch {
    variants = [];
  }

  const related = await prisma.product.findMany({
    where: { active: true, category: product.category, id: { not: product.id } },
    orderBy: { sortOrder: "asc" },
    take: 3,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    category: product.category,
    brand: { "@type": "Brand", name: "Femme Beauty" },
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      price: product.price,
      availability:
        product.status === "SOLD_OUT"
          ? "https://schema.org/OutOfStock"
          : product.status === "MADE_TO_ORDER"
            ? "https://schema.org/PreOrder"
            : "https://schema.org/InStock",
    },
  };

  return (
    <div className="shell py-8 lg:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-muted">
        <Link href="/shop" className="hover:text-espresso">
          Shop
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/shop?category=${product.category}`} className="hover:text-espresso">
          {product.category}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate text-espresso/70">{product.name}</span>
      </nav>

      <div className="mt-7 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <div className="relative overflow-hidden rounded-[2rem]">
            <ProductArt
              category={product.category}
              seed={product.slug}
              className="aspect-[4/5] w-full"
            />
            <span className="absolute left-4 top-4 rounded-full bg-cream/85 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-espresso backdrop-blur">
              {product.category}
            </span>
          </div>
          <p className="mt-3 text-center text-[11px] text-muted">
            Studio photography coming soon — this piece is finished by hand, so no two are identical.
          </p>
        </div>

        <div className="lg:pt-2">
          <p className="text-[10px] uppercase tracking-[0.22em] text-rose-deep">{product.category}</p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-ink sm:text-5xl">
            {product.name}
          </h1>
          {product.description && (
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">{product.description}</p>
          )}

          <div className="mt-7">
            <OrderPanel
              productId={product.id}
              slug={product.slug}
              name={product.name}
              price={product.price}
              compareAt={product.compareAt}
              category={product.category}
              status={product.status}
              variants={variants}
              whatsapp={settings.whatsapp}
            />
          </div>

          <div className="mt-9 divide-y divide-line border-y border-line">
            {[
              {
                title: "Details & care",
                body:
                  product.category === "Wigs" || product.category === "Hair"
                    ? "Wash with sulphate-free shampoo, condition mid-length to ends, and air-dry on a stand. Store on a wig head or in a silk bag. Avoid heavy oils at the roots."
                    : product.category === "Lashes"
                      ? "Keep dry for 24 hours after application. Remove adhesive with a dedicated remover — never pull. Store strips in their tray to keep the curl."
                      : "Store in a cool, dry place. For press-ons, keep the application kit and follow the included instructions for a 2–3 week wear.",
              },
              {
                title: "Delivery",
                body: settings.deliveryNote,
              },
              {
                title: "Questions before you order?",
                body: "Message us on WhatsApp — we'll send extra photos, confirm the exact batch, and help you choose a length or lace.",
              },
            ].map((item) => (
              <details key={item.title} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-espresso">
                  {item.title}
                  <span className="text-lg font-light text-muted transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
              </details>
            ))}
          </div>

          <p className="mt-6 text-[11px] uppercase tracking-[0.14em] text-muted">
            Reference {product.sku ?? product.slug} · {money(product.price)}
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-3xl text-ink">More in {product.category.toLowerCase()}</h2>
            <Link
              href={`/shop?category=${product.category}`}
              className="flex items-center gap-1 text-sm text-espresso hover:text-rose-deep"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All
            </Link>
          </div>
          <div className="no-scrollbar -mx-5 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:mt-7 sm:grid sm:grid-cols-3 sm:gap-x-5 sm:overflow-visible sm:px-0">
            {related.map((item) => (
              <div key={item.id} className="w-[72%] shrink-0 snap-start sm:w-auto">
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
