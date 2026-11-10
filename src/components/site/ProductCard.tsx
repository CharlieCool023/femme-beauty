import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SmartImage } from "@/components/site/SmartImage";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";

export type CardProduct = {
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAt: number | null;
  status: string;
  variantsJson: string;
  image?: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  IN_STOCK: "In stock",
  MADE_TO_ORDER: "Made to order",
  SOLD_OUT: "Sold out",
};

export function parseVariants(json: string): { label: string; price: number }[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function ProductCard({ product, priority }: { product: CardProduct; priority?: boolean }) {
  const variants = parseVariants(product.variantsJson);
  const lowest = variants.length ? Math.min(...variants.map((v) => v.price)) : product.price;
  const soldOut = product.status === "SOLD_OUT";

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-[1.25rem] bg-blush">
        <SmartImage
          src={product.image}
          alt={product.name}
          category={product.category}
          seed={product.slug}
          className="aspect-[4/5] w-full transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.compareAt && product.compareAt > product.price && !soldOut && (
            <span className="rounded-full bg-ink/85 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.16em] text-cream">
              Save {money(product.compareAt - product.price)}
            </span>
          )}
          {soldOut && (
            <span className="rounded-full bg-cream/90 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.16em] text-espresso">
              Sold out
            </span>
          )}
        </div>
        <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-cream/90 text-espresso opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">{product.category}</p>
          <h3 className="mt-1 font-display text-[19px] leading-snug text-ink">{product.name}</h3>
          <p className={cn("mt-1 text-sm", soldOut ? "text-muted line-through" : "text-ink/80")}>
            {variants.length > 1 && <span className="text-muted">from </span>}
            {money(lowest)}
          </p>
        </div>
        <span
          className={cn(
            "mt-1 shrink-0 rounded-full px-2 py-1 text-[9px] uppercase tracking-[0.12em]",
            product.status === "IN_STOCK" && "bg-[#eaf3ea] text-[#3f6b45]",
            product.status === "MADE_TO_ORDER" && "bg-blush text-rose-deep",
            product.status === "SOLD_OUT" && "bg-line/60 text-muted",
          )}
        >
          {STATUS_LABEL[product.status] ?? product.status}
        </span>
      </div>
    </Link>
  );
}
