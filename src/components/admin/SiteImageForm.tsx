"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { saveSiteImageAction, type ActionState } from "@/app/admin/actions";
import { MediaUploader } from "@/components/admin/MediaUploader";

const initial: ActionState = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary btn-sm">
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
      Save image
    </button>
  );
}

export function SiteImageForm({
  slot,
  label,
  description,
  currentUrl,
  alt,
}: {
  slot: string;
  label: string;
  description: string;
  currentUrl: string | null;
  alt: string | null;
}) {
  const [state, formAction] = useActionState(saveSiteImageAction, initial);

  return (
    <form action={formAction} className="rounded-xl border border-line bg-white/70 p-4">
      <input type="hidden" name="key" value={slot} />
      <div className="flex gap-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-line bg-blush">
          {currentUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentUrl} alt={alt ?? label} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center px-2 text-center text-[9px] uppercase tracking-[0.1em] text-muted">
              Default art
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">{label}</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{description}</p>

          <div className="mt-2">
            <MediaUploader name="mediaId" label="Upload photo" />
          </div>

          <div className="mt-2">
            <label htmlFor={`alt-${slot}`} className="label">
              Alt text (for accessibility)
            </label>
            <input
              id={`alt-${slot}`}
              name="alt"
              defaultValue={alt ?? ""}
              className="field py-1.5 text-[12px]"
              placeholder="e.g. Frontal install with soft waves"
            />
          </div>

          {currentUrl && (
            <label className="mt-2 flex items-center gap-2 text-[11px] text-muted">
              <input type="checkbox" name="remove" className="h-3.5 w-3.5 accent-[#9e6353]" />
              Remove this image and use the default art
            </label>
          )}

          {state.error && <p className="mt-2 text-[11px] text-rose-deep">{state.error}</p>}
          {state.success && <p className="mt-2 text-[11px] text-[#3f6b45]">{state.success}</p>}

          <div className="mt-3">
            <Submit />
          </div>
        </div>
      </div>
    </form>
  );
}
