"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { compressImage } from "@/lib/client-image";
import { cn } from "@/lib/utils";

type Uploaded = { id: string; url: string };

/**
 * Uploads images to /api/admin/media as soon as they're picked and leaves
 * hidden inputs behind, so the surrounding form only submits media IDs.
 */
export function MediaUploader({
  name,
  multiple = false,
  label = "Add photos",
  hint,
  className,
}: {
  name: string;
  multiple?: boolean;
  label?: string;
  hint?: string;
  className?: string;
}) {
  const [items, setItems] = useState<Uploaded[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setBusy(true);

    try {
      const next: Uploaded[] = [];
      for (const file of Array.from(files)) {
        const compressed = await compressImage(file);
        const body = new FormData();
        body.append("file", compressed, compressed.name);

        const response = await fetch("/api/admin/media", { method: "POST", body });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Upload failed");
        next.push({ id: data.id, url: data.url });
      }
      setItems((current) => (multiple ? [...current, ...next] : next));
      if (!multiple) {
        // Replacing: keep only the newest hidden input.
        setItems(next.slice(-1));
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <div key={item.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt=""
                className="h-20 w-20 rounded-lg border border-line object-cover"
              />
              <input type="hidden" name={name} value={item.id} />
              <button
                type="button"
                onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-cream"
                aria-label="Remove uploaded image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex items-center gap-2 rounded-lg border border-dashed border-line px-3 py-2 text-[11px] text-ink/70 transition hover:border-rose-deep hover:text-rose-deep disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
        {busy ? "Uploading…" : label}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple={multiple}
        onChange={(event) => void upload(event.target.files)}
        className="hidden"
      />

      {hint && !error && <p className="text-[10px] leading-relaxed text-muted">{hint}</p>}
      {error && <p className="text-[11px] text-rose-deep">{error}</p>}
    </div>
  );
}
