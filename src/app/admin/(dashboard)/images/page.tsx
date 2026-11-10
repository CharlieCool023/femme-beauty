import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { SiteImageForm } from "@/components/admin/SiteImageForm";
import { GalleryAddForm } from "@/components/admin/GalleryAddForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteGalleryImageAction, updateGalleryImageAction } from "@/app/admin/actions";
import { PRODUCT_CATEGORIES } from "@/lib/content";
import { Image as ImageIcon, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

const SLOTS = [
  {
    key: "hero",
    label: "Homepage hero",
    description: "The large image at the top of the homepage, behind the signature-service caption.",
  },
  {
    key: "about",
    label: "About page portrait",
    description: "The tall image beside the studio story on the About page.",
  },
  {
    key: "story",
    label: "Custom wig story",
    description: "The image in the “built on your measurements” section of the homepage.",
  },
];

export default async function AdminImagesPage() {
  const [siteImages, gallery] = await Promise.all([
    prisma.siteImage.findMany(),
    prisma.galleryImage.findMany({
      include: { media: { select: { id: true } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  const byKey = new Map(siteImages.map((image) => [image.key, image]));

  return (
    <div>
      <PageHeader
        title="Images"
        subtitle="Every photo on the website lives here — replace the default art, upload new looks, edit captions."
      />

      <section>
        <div className="mb-3 flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-rose-deep" />
          <h2 className="font-display text-2xl text-ink">Page images</h2>
        </div>
        <div className="space-y-3">
          {SLOTS.map((slot) => {
            const current = byKey.get(slot.key);
            return (
              <SiteImageForm
                key={slot.key}
                slot={slot.key}
                label={slot.label}
                description={slot.description}
                currentUrl={current?.mediaId ? `/api/media/${current.mediaId}` : null}
                alt={current?.alt ?? null}
              />
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-ink">Lookbook</h2>
        <p className="mt-1 text-xs text-muted">
          These photos power the gallery page, the homepage strip and the about-page collage. Add up
          to four or more — the newest four make the collage.
        </p>

        <div className="mt-4">
          <GalleryAddForm />
        </div>

        {gallery.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-6 text-center text-xs text-muted">
            No photos yet — the site is showing the designed placeholders. Add your first look above.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {gallery.map((image) => (
              <div key={image.id} className="rounded-xl border border-line bg-white/70 p-3">
                <div className="flex gap-3">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-blush">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/media/${image.mediaId}`}
                      alt={image.caption}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <form action={updateGalleryImageAction} className="min-w-0 flex-1 space-y-2">
                    <input type="hidden" name="id" value={image.id} />
                    <input
                      name="caption"
                      defaultValue={image.caption}
                      className="field py-1.5 text-[12px]"
                      placeholder="Caption"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        name="tag"
                        defaultValue={image.tag ?? ""}
                        className="field py-1.5 text-[12px]"
                        placeholder="Tag"
                      />
                      <select
                        name="category"
                        defaultValue={image.category}
                        className="field py-1.5 text-[12px]"
                      >
                        {PRODUCT_CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-1.5 text-[10px] text-muted">
                        Order
                        <input
                          type="number"
                          name="sortOrder"
                          defaultValue={image.sortOrder}
                          className="field w-16 py-1 text-[11px]"
                        />
                      </label>
                      <label className="flex items-center gap-1.5 text-[10px] text-muted">
                        <input
                          type="checkbox"
                          name="active"
                          defaultChecked={image.active}
                          className="h-3.5 w-3.5 accent-[#9e6353]"
                        />
                        Visible
                      </label>
                      <button type="submit" className="btn-outline btn-sm">
                        Save
                      </button>
                    </div>
                  </form>
                </div>

                <form action={deleteGalleryImageAction} className="mt-2 text-right">
                  <input type="hidden" name="id" value={image.id} />
                  <ConfirmButton
                    message="Remove this photo from the lookbook? The file stays in storage."
                    className="inline-flex items-center gap-1 text-[10px] text-rose-deep hover:underline"
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </ConfirmButton>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="mt-6 text-[11px] leading-relaxed text-muted">
        Photos are stored in your own database and served from this site — no third-party image
        host. Uploads are resized in the browser first, and JPG, PNG, WebP or AVIF up to 8MB are
        accepted.
      </p>
    </div>
  );
}
