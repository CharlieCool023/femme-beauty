"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Check, Truck, Sparkles } from "lucide-react";
import { money } from "@/lib/format";
import { cn, whatsappLink } from "@/lib/utils";

type Variant = { label: string; price: number };

type Props = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  compareAt: number | null;
  category: string;
  status: string;
  variants: Variant[];
  whatsapp: string;
};

export function OrderPanel({
  productId,
  slug,
  name,
  price,
  compareAt,
  category,
  status,
  variants,
  whatsapp,
}: Props) {
  const [selected, setSelected] = useState<number>(variants.length ? 0 : -1);

  const current = useMemo(() => {
    if (selected >= 0 && variants[selected]) return variants[selected];
    return { label: "", price };
  }, [selected, variants, price]);

  const soldOut = status === "SOLD_OUT";
  const madeToOrder = status === "MADE_TO_ORDER";

  function order() {
    const label = current.label ? ` (${current.label})` : "";
    const message = soldOut
      ? `Hi Femme Beauty! Please add me to the waitlist for ${name}${label} — ${money(current.price)}.`
      : `Hi Femme Beauty! I'd like to order the ${name}${label} — ${money(
          current.price,
        )}. Is it available?${
          typeof window !== "undefined" ? `\n\n${window.location.href}` : ""
        }`;

    window.open(whatsappLink(whatsapp, message), "_blank", "noopener,noreferrer");

    void fetch("/api/order-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        productName: name,
        variant: current.label || null,
        amount: current.price,
        slug,
        category,
      }),
    }).catch(() => {});
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-display text-3xl text-ink">{money(current.price)}</span>
        {compareAt && compareAt > current.price && (
          <>
            <span className="text-sm text-muted line-through">{money(compareAt)}</span>
            <span className="rounded-full bg-blush px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-rose-deep">
              Save {money(compareAt - current.price)}
            </span>
          </>
        )}
      </div>

      <p className="mt-2 text-xs">
        {soldOut ? (
          <span className="text-rose-deep">Currently sold out — join the waitlist below.</span>
        ) : madeToOrder ? (
          <span className="flex items-center gap-1.5 text-muted">
            <Sparkles className="h-3.5 w-3.5 text-rose" /> Made to order · 7–14 working days
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[#3f6b45]">
            <Check className="h-3.5 w-3.5" /> In stock · Lagos same-day dispatch before 2pm
          </span>
        )}
      </p>

      {variants.length > 0 && (
        <div className="mt-7">
          <p className="label">
            {category === "Nails" ? "Length" : category === "Lashes" ? "Style" : "Length"}
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant, index) => {
              const active = index === selected;
              return (
                <button
                  key={variant.label}
                  type="button"
                  onClick={() => setSelected(index)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition",
                    active
                      ? "border-ink bg-ink text-cream"
                      : "border-line text-ink/75 hover:border-ink/50",
                  )}
                  aria-pressed={active}
                >
                  {variant.label}
                  <span className={cn("ml-2 text-[11px]", active ? "text-cream/60" : "text-muted")}>
                    {money(variant.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button type="button" onClick={order} className="btn-rose mt-7 w-full">
        <MessageCircle className="h-4 w-4" />
        {soldOut ? "Join the waitlist on WhatsApp" : "Order on WhatsApp"}
      </button>

      <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
        No card needed. We confirm stock, delivery and payment with you in chat.
      </p>

      <div className="mt-7 grid gap-3 rounded-2xl bg-shell p-4 text-xs text-muted sm:grid-cols-2">
        <p className="flex items-start gap-2">
          <Truck className="mt-0.5 h-4 w-4 shrink-0 text-rose-deep" />
          Nationwide delivery. Lagos orders before 2pm go out same day.
        </p>
        <p className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-rose-deep" />
          Made-to-order pieces are quoted with a timeline before payment.
        </p>
      </div>
    </div>
  );
}
