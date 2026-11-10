"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ImagePlus, Loader2 } from "lucide-react";
import { addGalleryImageAction, type ActionState } from "@/app/admin/actions";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { PRODUCT_CATEGORIES } from "@/lib/content";

const initial: ActionState = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-rose btn-sm">
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
      Add to lookbook
    </button>
  );
}

export function GalleryAddForm() {
  const [state, formAction] = useActionState(addGalleryImageAction, initial);

  return (
    <form action={formAction} className="rounded-xl border border-line bg-white/70 p-4">
      <p className="text-sm font-medium text-ink">Add a look</p>
      <p className="mt-0.5 text-[11px] text-muted">
        Upload a photo, give it a caption and it appears in the lookbook, on the homepage strip and
        in the about-page collage.
      </p>

      <div className="mt-3">
        <MediaUploader name="mediaId" label="Choose a photo" />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="gallery-caption" className="label">
            Caption
          </label>
          <input
            id="gallery-caption"
            name="caption"
            className="field py-2"
            placeholder="Bone straight, middle part"
          />
        </div>
        <div>
          <label htmlFor="gallery-tag" className="label">
            Tag
          </label>
          <input id="gallery-tag" name="tag" className="field py-2" placeholder="Wig install" />
        </div>
        <div>
          <label htmlFor="gallery-category" className="label">
            Category
          </label>
          <select id="gallery-category" name="category" className="field py-2" defaultValue="Wigs">
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <Submit />
        </div>
      </div>

      {state.error && <p className="mt-2 text-[11px] text-rose-deep">{state.error}</p>}
      {state.success && <p className="mt-2 text-[11px] text-[#3f6b45]">{state.success}</p>}
    </form>
  );
}
