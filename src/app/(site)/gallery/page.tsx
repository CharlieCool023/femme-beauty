import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { SmartImage } from "@/components/site/SmartImage";
import { GALLERY } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Recent wig installs, braids, nails and lash sets from the Femme Beauty studio in Fadeyi, Lagos.",
};

export default async function GalleryPage() {
  const rows = await prisma.galleryImage.findMany({
    where: { active: true },
    include: { media: { select: { id: true } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const items = rows.length
    ? rows.map((image) => ({
        title: image.caption,
        tag: image.tag ?? "",
        category: image.category,
        url: `/api/media/${image.mediaId}`,
      }))
    : GALLERY.map((item) => ({ ...item, url: null }));

  return (
    <div className="shell py-12 lg:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow">The lookbook</p>
        <h1 className="mt-3 font-display text-5xl leading-tight text-ink sm:text-6xl">
          The work, up close.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          A mix of installs, custom units, nails and lashes from the studio. Save a look, bring it
          to your appointment, and we&apos;ll adapt it to your hair and face.
        </p>
      </header>

      <div className="mt-10 columns-2 gap-4 md:columns-3 [&>*]:mb-4">
        {items.map((item, index) => (
          <figure key={`${item.title}-${index}`} className="group break-inside-avoid">
            <div className="overflow-hidden rounded-2xl">
              <SmartImage
                src={item.url}
                alt={item.title}
                category={item.category}
                seed={`look-${index}`}
                className={`w-full ${index % 3 === 1 ? "aspect-[3/4]" : "aspect-[4/5]"} transition-transform duration-700 group-hover:scale-[1.03]`}
              />
            </div>
            <figcaption className="mt-2.5 flex items-baseline justify-between gap-3">
              <span className="font-display text-lg text-ink">{item.title}</span>
              <span className="shrink-0 text-[9px] uppercase tracking-[0.14em] text-muted">
                {item.tag}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      {rows.length === 0 && (
        <p className="mt-10 rounded-xl bg-shell px-5 py-4 text-center text-xs leading-relaxed text-muted">
          Studio photography is being refreshed — for the newest looks, message us on WhatsApp or see
          the latest on Instagram.
        </p>
      )}

      <div className="mt-8 text-center">
        <Link href="/book" className="btn-rose">
          Book your look
        </Link>
      </div>
    </div>
  );
}
