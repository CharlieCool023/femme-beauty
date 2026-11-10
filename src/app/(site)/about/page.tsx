import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Heart, Scissors, Sparkles } from "lucide-react";
import { ProductArt } from "@/components/site/ProductArt";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About the studio",
  description:
    "Femme Beauty is a Lagos hair and beauty studio in Fadeyi — custom wigs, raw hair, nails and lashes, made by hand.",
};

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div>
      <section className="shell grid gap-12 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
        <div>
          <p className="eyebrow">The studio</p>
          <h1 className="mt-3 text-balance font-display text-5xl leading-[1.02] text-ink sm:text-6xl">
            Made by hand. <span className="italic text-rose-deep">Worn with confidence.</span>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">{settings.aboutStory}</p>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
            We started with wigs because a good unit changes how a week feels. Then nails, then
            lashes — because the same care applies. Everything is measured, fitted and finished by
            hand in our Fadeyi studio.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/book" className="btn-rose">
              Book with us <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={settings.instagram} target="_blank" rel="noreferrer" className="btn-outline">
              See us on Instagram
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[2rem]">
            <ProductArt category="Wigs" seed="about-studio" className="aspect-[4/5] w-full" />
          </div>
          <div className="absolute -bottom-6 -left-4 max-w-[220px] rounded-2xl bg-cream p-5 shadow-xl sm:-left-8">
            <p className="font-script text-3xl leading-none text-rose-deep">Syl</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted">Founder & lead stylist</p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              “If it isn&apos;t good enough for me to wear out, it doesn&apos;t leave the studio.”
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-shell/60">
        <div className="shell grid gap-10 py-14 sm:grid-cols-3">
          {[
            {
              icon: Heart,
              title: "Made for you",
              body: "Measurements kept on file, density chosen with you, hairline plucked to your face — not a one-size unit.",
            },
            {
              icon: Scissors,
              title: "Finished by hand",
              body: "Bleaching, plucking, styling, nail shaping and lash mapping all happen in-studio. Nothing is outsourced.",
            },
            {
              icon: Sparkles,
              title: "Worth the wait",
              body: "One client at a time. Your appointment is your time, so we don't stack bookings or rush the finish.",
            },
          ].map((value) => (
            <div key={value.title}>
              <value.icon className="h-5 w-5 text-rose-deep" />
              <h2 className="mt-3 font-display text-2xl text-ink">{value.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{value.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="shell grid gap-8 py-14 lg:grid-cols-2">
        <div>
          <p className="eyebrow">The details</p>
          <h2 className="mt-3 font-display text-4xl text-ink">Come and see us.</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            The studio is appointment-only, so there&apos;s no queue and no rush. We&apos;re a short
            walk from Fadeyi, with parking on the street.
          </p>
          <dl className="mt-7 space-y-4 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">Address</dt>
              <dd className="mt-1 text-ink">{settings.address}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">Hours</dt>
              <dd className="mt-1 text-ink">Monday – Saturday, 9am – 7pm · Sunday closed</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">Contact</dt>
              <dd className="mt-1 text-ink">
                {settings.phone} · {settings.email}
              </dd>
            </div>
          </dl>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ProductArt category="Nails" seed="about-nails" className="aspect-square rounded-2xl" />
          <ProductArt category="Lashes" seed="about-lashes" className="mt-8 aspect-square rounded-2xl" />
          <ProductArt category="Braids" seed="about-braids" className="aspect-square rounded-2xl" />
          <ProductArt category="Hair" seed="about-hair" className="mt-8 aspect-square rounded-2xl" />
        </div>
      </section>
    </div>
  );
}
