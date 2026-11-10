"use client";

import { useState } from "react";
import { ProductArt } from "@/components/site/ProductArt";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
  category,
  seed,
}: {
  images: { url: string; alt: string | null }[];
  name: string;
  category: string;
  seed: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="overflow-hidden rounded-[2rem]">
        <ProductArt category={category} seed={seed} className="aspect-[4/5] w-full" />
      </div>
    );
  }

  const current = images[Math.min(active, images.length - 1)];

  return (
    <div>
      <div className="overflow-hidden rounded-[2rem] bg-blush">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={current.alt ?? name}
          className="aspect-[4/5] w-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition",
                index === active ? "border-rose-deep" : "border-transparent opacity-70 hover:opacity-100",
              )}
              aria-label={`Photo ${index + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
