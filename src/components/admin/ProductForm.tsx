"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { saveProductAction, type ActionState } from "@/app/admin/actions";
import { PRODUCT_CATEGORIES } from "@/lib/content";

const initial: ActionState = {};

type ProductValues = {
  id?: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
  compareAt: number | null;
  sku: string | null;
  status: string;
  variantsJson: string;
  featured: boolean;
  active: boolean;
};

function Submit({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {isNew ? "Create product" : "Save changes"}
    </button>
  );
}

function variantsToText(json: string) {
  try {
    const parsed = JSON.parse(json) as { label: string; price: number }[];
    if (!Array.isArray(parsed)) return "";
    return parsed.map((variant) => `${variant.label} | ${variant.price}`).join("\n");
  } catch {
    return "";
  }
}

export function ProductForm({ product }: { product?: ProductValues }) {
  const [state, formAction] = useActionState(saveProductAction, initial);
  const isNew = !product?.id;

  return (
    <form action={formAction} className="space-y-4">
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      <div className="rounded-xl border border-line bg-white/70 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="label">
              Product name
            </label>
            <input id="name" name="name" defaultValue={product?.name} className="field" required />
          </div>

          <div>
            <label htmlFor="category" className="label">
              Category
            </label>
            <select id="category" name="category" defaultValue={product?.category ?? "Wigs"} className="field">
              {PRODUCT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="label">
              Availability
            </label>
            <select id="status" name="status" defaultValue={product?.status ?? "IN_STOCK"} className="field">
              <option value="IN_STOCK">In stock</option>
              <option value="MADE_TO_ORDER">Made to order</option>
              <option value="SOLD_OUT">Sold out</option>
            </select>
          </div>

          <div>
            <label htmlFor="price" className="label">
              Price (₦)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              step={500}
              defaultValue={product?.price ?? 0}
              className="field"
              required
            />
          </div>

          <div>
            <label htmlFor="compareAt" className="label">
              Compare-at price <span className="normal-case tracking-normal text-muted/60">(optional)</span>
            </label>
            <input
              id="compareAt"
              name="compareAt"
              type="number"
              min={0}
              step={500}
              defaultValue={product?.compareAt ?? ""}
              className="field"
              placeholder="Shows as a strike-through"
            />
          </div>

          <div>
            <label htmlFor="sku" className="label">
              SKU / reference
            </label>
            <input id="sku" name="sku" defaultValue={product?.sku ?? ""} className="field" placeholder="FB-WIG-BS13" />
          </div>

          <div>
            <label htmlFor="variants" className="label">
              Variants <span className="normal-case tracking-normal text-muted/60">one per line</span>
            </label>
            <textarea
              id="variants"
              name="variants"
              defaultValue={product ? variantsToText(product.variantsJson) : ""}
              className="field min-h-[96px] resize-y font-mono text-xs"
              placeholder={'18" | 265000\n20" | 285000\n22" | 305000'}
            />
            <p className="mt-1 text-[10px] text-muted">Format: label | price. Leave blank for a single price.</p>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={product?.description ?? ""}
              className="field min-h-[110px] resize-y"
              placeholder="Lace type, density, hair origin, what's included."
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-5 border-t border-line pt-4">
          <label className="flex items-center gap-2 text-sm text-ink/80">
            <input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="h-4 w-4 accent-[#9e6353]" />
            Visible in the shop
          </label>
          <label className="flex items-center gap-2 text-sm text-ink/80">
            <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} className="h-4 w-4 accent-[#9e6353]" />
            Feature on the homepage
          </label>
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg border border-rose-deep/30 bg-rose-deep/5 px-3 py-2 text-xs text-rose-deep">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Submit isNew={isNew} />
        <Link href="/admin/products" className="text-xs text-muted hover:text-ink">
          Cancel
        </Link>
      </div>
    </form>
  );
}
