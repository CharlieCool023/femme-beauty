"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { saveServiceAction, type ActionState } from "@/app/admin/actions";
import { SERVICE_CATEGORIES } from "@/lib/content";

const initial: ActionState = {};

type ServiceValues = {
  id?: string;
  name: string;
  category: string;
  description: string | null;
  durationMin: number;
  price: number;
  depositPct: number | null;
  bufferAfterMin: number;
  active: boolean;
  featured: boolean;
};

function Submit({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {isNew ? "Create service" : "Save changes"}
    </button>
  );
}

export function ServiceForm({ service }: { service?: ServiceValues }) {
  const [state, formAction] = useActionState(saveServiceAction, initial);
  const isNew = !service?.id;

  return (
    <form action={formAction} className="space-y-4">
      {service?.id && <input type="hidden" name="id" value={service.id} />}

      <div className="rounded-xl border border-line bg-white/70 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="label">
              Service name
            </label>
            <input
              id="name"
              name="name"
              defaultValue={service?.name}
              className="field"
              placeholder="e.g. Frontal Wig Install"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="label">
              Category
            </label>
            <select id="category" name="category" defaultValue={service?.category ?? "Hair Care"} className="field">
              {SERVICE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="durationMin" className="label">
              Duration (minutes)
            </label>
            <input
              id="durationMin"
              name="durationMin"
              type="number"
              min={15}
              step={15}
              defaultValue={service?.durationMin ?? 60}
              className="field"
              required
            />
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
              defaultValue={service?.price ?? 0}
              className="field"
              required
            />
          </div>

          <div>
            <label htmlFor="depositPct" className="label">
              Deposit % <span className="normal-case tracking-normal text-muted/60">(blank = global)</span>
            </label>
            <input
              id="depositPct"
              name="depositPct"
              type="number"
              min={0}
              max={100}
              defaultValue={service?.depositPct ?? ""}
              className="field"
              placeholder="Uses the global setting"
            />
          </div>

          <div>
            <label htmlFor="bufferAfterMin" className="label">
              Buffer after (minutes)
            </label>
            <input
              id="bufferAfterMin"
              name="bufferAfterMin"
              type="number"
              min={0}
              step={5}
              defaultValue={service?.bufferAfterMin ?? 15}
              className="field"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={service?.description ?? ""}
              className="field min-h-[90px] resize-y"
              placeholder="What's included, how it finishes, anything the client should know."
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-5 border-t border-line pt-4">
          <label className="flex items-center gap-2 text-sm text-ink/80">
            <input type="checkbox" name="active" defaultChecked={service?.active ?? true} className="h-4 w-4 accent-[#9e6353]" />
            Bookable on the website
          </label>
          <label className="flex items-center gap-2 text-sm text-ink/80">
            <input type="checkbox" name="featured" defaultChecked={service?.featured ?? false} className="h-4 w-4 accent-[#9e6353]" />
            Show on the homepage
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
        <Link href="/admin/services" className="text-xs text-muted hover:text-ink">
          Cancel
        </Link>
      </div>
    </form>
  );
}
