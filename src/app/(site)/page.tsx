import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkles, CalendarCheck, Package } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { money } from "@/lib/format";
import { durationLabel } from "@/lib/time";
import { SmartImage } from "@/components/site/SmartImage";
import { ProductCard } from "@/components/site/ProductCard";
import { GALLERY } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSettings();
  const [services, products, testimonials, siteImages, galleryRows] = await Promise.all([
    prisma.service.findMany({
      where: { active: true, featured: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
    }),
    prisma.product.findMany({
      where: { active: true, featured: true },
      orderBy: { sortOrder: "asc" },
      take: 4,
    }),
    prisma.testimonial.findMany({ where: { active: true }, take: 3 }),
    prisma.siteImage.findMany(),
    prisma.galleryImage.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 6,
    }),
  ]);

  const imageFor = (key: string) => {
    const mediaId = siteImages.find((image) => image.key === key)?.mediaId;
    return mediaId ? `/api/media/${mediaId}` : null;
  };

  const gallery = galleryRows.length
    ? galleryRows.map((image) => ({
        title: image.caption,
        tag: image.tag ?? "",
        category: image.category,
        url: `/api/media/${image.mediaId}`,
      }))
    : GALLERY.slice(0, 6).map((item) => ({ ...item, url: null }));

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 top-6 select-none font-script text-[15rem] leading-none text-rose/10 sm:text-[26rem]"
        >
          Femme
        </div>

        <div className="shell relative grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1.02fr_0.98fr] lg:py-24">
          <div className="rise">
            <p className="eyebrow">Fadeyi, Lagos · Hair & beauty studio</p>
            <h1 className="mt-4 text-balance font-display text-[40px] leading-[0.98] text-ink sm:mt-5 sm:text-6xl lg:text-[70px]">
              Hair, nails &amp; lashes,
              <br />
              <span className="italic text-rose-deep">made for you.</span>
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted sm:mt-6">
              Custom wigs and raw hair, braids that don&apos;t pull, gele and makeup for the big day,
              and nails and lashes finished by hand. Book your seat at the Fadeyi studio — or shop
              the collection from anywhere in Nigeria.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              <Link href="/book" className="btn-rose group w-full sm:w-auto">
                Book an appointment
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/shop" className="btn-outline w-full sm:w-auto">
                Shop the collection
              </Link>
            </div>

            <dl className="mt-9 grid max-w-md grid-cols-3 gap-3 border-t border-line pt-6 sm:mt-11 sm:gap-4">
              {[
                { icon: CalendarCheck, label: "Appointment only", sub: "No crowded waiting room" },
                { icon: Sparkles, label: "Made by hand", sub: "Not off a shelf" },
                { icon: Package, label: "Nationwide", sub: "Delivery across Nigeria" },
              ].map((item) => (
                <div key={item.label}>
                  <item.icon className="mb-2 h-4 w-4 text-rose-deep" />
                  <dt className="text-[12px] font-medium text-espresso">{item.label}</dt>
                  <dd className="mt-0.5 text-[11px] leading-snug text-muted">{item.sub}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:mr-0">
            <div className="overflow-hidden rounded-[2rem] shadow-[0_30px_80px_-30px_rgba(59,42,36,0.4)]">
              <div className="relative">
                <SmartImage
                  src={imageFor("hero")}
                  alt="Femme Beauty signature install"
                  category="Wigs"
                  seed="hero-frontal"
                  className="aspect-[4/5] w-full"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2b1d18]/80 via-[#2b1d18]/25 to-transparent p-6 pt-16 text-cream">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-cream/70">
                    Signature service
                  </p>
                  <p className="mt-2 font-display text-2xl">Frontal wig install</p>
                  <p className="mt-1 text-sm text-cream/80">
                    from {money(45000)} · 2 hours
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute left-2 -top-4 flex h-20 w-20 rotate-[-8deg] flex-col items-center justify-center rounded-full bg-rose-deep text-center text-cream shadow-lg sm:-left-8 sm:h-24 sm:w-24">
              <span className="font-script text-lg leading-none sm:text-xl">made</span>
              <span className="mt-1 text-[7px] uppercase tracking-[0.22em] sm:text-[8px]">by hand</span>
            </div>

            <div className="absolute -bottom-5 right-2 rounded-2xl border border-line bg-cream/95 px-3.5 py-2.5 shadow-xl backdrop-blur sm:-right-6 sm:px-4 sm:py-3">
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4b8b5a]" />
                Booking this week
              </p>
              <p className="mt-1 text-sm text-espresso">Mon–Sat · slots open</p>
            </div>
          </div>
        </div>
      </section>

      {/* Service menu */}
      <section className="shell mt-10 lg:mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">The menu</p>
            <h2 className="mt-3 font-display text-4xl text-ink sm:text-5xl">Come for one thing.</h2>
            <p className="mt-2 max-w-md text-sm text-muted">
              Stay for the whole look. Every service is a proper appointment, with time built in.
            </p>
          </div>
          <Link href="/services" className="link-underline text-sm text-espresso">
            Full price list
          </Link>
        </div>

        <div className="mt-9 grid gap-x-12 sm:grid-cols-2">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/book?service=${service.slug}`}
              className="group flex items-baseline justify-between gap-4 border-b border-line py-5 transition-colors hover:border-rose"
            >
              <span className="min-w-0 pr-2">
                <span className="font-display text-lg text-ink group-hover:text-rose-deep sm:text-xl">
                  {service.name}
                </span>
                <span className="ml-2 whitespace-nowrap text-[11px] uppercase tracking-[0.12em] text-muted">
                  {durationLabel(service.durationMin)}
                </span>
              </span>
              <span className="shrink-0 text-sm text-espresso">{money(service.price)}</span>
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl bg-shell px-5 py-4 sm:flex-row sm:items-center">
          <p className="text-sm text-muted">
            Don&apos;t see exactly what you want? We also make custom pieces and styles.
          </p>
          <Link href="/book?mode=custom" className="text-sm text-espresso underline decoration-rose/50 underline-offset-4 hover:text-rose-deep">
            Describe your request →
          </Link>
        </div>
      </section>
      <section className="shell mt-20 sm:mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">The shop</p>
            <h2 className="mt-3 font-display text-4xl text-ink sm:text-5xl">New in the shop</h2>
          </div>
          <Link href="/shop" className="link-underline text-sm text-espresso">
            Shop everything
          </Link>
        </div>
        <div className="no-scrollbar -mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:mt-9 sm:grid sm:grid-cols-2 sm:gap-x-5 sm:gap-y-9 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="w-[72%] shrink-0 snap-start sm:w-auto">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted sm:hidden">
          Swipe to see more →
        </p>
      </section>

      {/* Custom story */}
      <section className="mt-20 bg-shell py-14 sm:mt-24 sm:py-16 lg:py-24">
        <div className="shell grid items-center gap-12 lg:grid-cols-2">
          <div className="relative order-2 lg:order-1">
            <div className="overflow-hidden rounded-[2rem]">
              <SmartImage
                src={imageFor("story")}
                alt="A custom unit being made at Femme Beauty"
                category="Hair"
                seed="custom-build"
                className="aspect-[5/4] w-full"
              />
            </div>
            <div className="absolute -bottom-5 left-6 rounded-xl bg-cream px-5 py-4 shadow-lg">
              <p className="font-display text-2xl text-espresso">7–14 days</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted">typical custom build</p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="eyebrow">Bespoke</p>
            <h2 className="mt-3 text-balance font-display text-4xl leading-tight text-ink sm:text-5xl">
              A unit built on <span className="italic text-rose-deep">your</span> measurements.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
              Cap size, density, hairline and length — chosen with you, not for you. We measure
              once, keep it on file, and your next unit fits like it was made for you. Because it
              was.
            </p>

            <ul className="mt-7 space-y-4">
              {[
                ["Consultation & measurements", "45 minutes, credited to your order"],
                ["Hair selected with you", "Raw Vietnamese and Cambodian, your pick"],
                ["Built, bleached and plucked", "Finished in-studio, ready to wear"],
              ].map(([title, sub]) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-deep" />
                  <span>
                    <span className="block text-sm text-espresso">{title}</span>
                    <span className="block text-xs text-muted">{sub}</span>
                  </span>
                </li>
              ))}
            </ul>

            <Link href="/book?service=custom-wig-consultation" className="btn-primary mt-8">
              Book a consultation
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery strip */}
      <section className="shell mt-20 sm:mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">The lookbook</p>
            <h2 className="mt-3 font-display text-4xl text-ink sm:text-5xl">Recently, in the chair</h2>
          </div>
          <Link href="/gallery" className="link-underline text-sm text-espresso">
            See the gallery
          </Link>
        </div>

        <div className="no-scrollbar -mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:mt-9 sm:px-0">
          {gallery.map((item, index) => (
            <Link
              key={item.title}
              href="/gallery"
              className="group relative w-[74%] shrink-0 snap-start overflow-hidden rounded-2xl sm:w-[280px]"
            >
              <SmartImage
                src={item.url}
                alt={item.title}
                category={item.category}
                seed={`gallery-${index}`}
                className="aspect-[4/5] w-full transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
                <p className="text-[9px] uppercase tracking-[0.2em] text-cream/70">{item.tag}</p>
                <p className="mt-1 font-display text-lg text-cream">{item.title}</p>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted sm:hidden">
          Swipe the lookbook →
        </p>
      </section>

      {/* Testimonials */}
      <section className="shell mt-20 sm:mt-24">
        <p className="eyebrow text-center">Kind words</p>
        <h2 className="mt-3 text-center font-display text-4xl text-ink sm:text-5xl">
          What they say after
        </h2>
        <div className="no-scrollbar -mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0">
          {testimonials.map((review) => (
            <figure key={review.id} className="card w-[85%] shrink-0 snap-start p-6 sm:w-auto">
              <div className="flex gap-1 text-rose-deep" aria-label={`${review.rating} out of 5`}>
                {Array.from({ length: review.rating }).map((_, i) => (
                  <span key={i} aria-hidden>
                    ★
                  </span>
                ))}
              </div>
              <blockquote className="mt-4 font-display text-[21px] leading-snug text-espresso">
                “{review.text}”
              </blockquote>
              <figcaption className="mt-5 text-xs uppercase tracking-[0.14em] text-muted">
                {review.name}
                {review.service ? ` · ${review.service}` : ""}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-20 sm:mt-24">
        <div className="shell">
          <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-14 text-center text-cream sm:px-12 lg:py-20">
            <span
              aria-hidden
              className="pointer-events-none absolute -left-6 -top-10 select-none font-script text-[14rem] leading-none text-white/5"
            >
              Femme
            </span>
            <p className="text-[11px] uppercase tracking-[0.3em] text-rose-light/80">Ready when you are</p>
            <h2 className="mx-auto mt-4 max-w-xl text-balance font-display text-4xl leading-tight sm:text-5xl">
              Let&apos;s get you on the calendar.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-cream/60">
              Pick a service, pick a time, and we&apos;ll confirm on WhatsApp. Your deposit secures
              the seat — the rest is the fun part.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/book" className="btn-rose">
                Book an appointment
              </Link>
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="btn border border-white/20 text-cream hover:bg-white/10"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
