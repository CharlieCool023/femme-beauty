import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { POLICIES } from "@/lib/content";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return POLICIES.map((policy) => ({ slug: policy.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const policy = POLICIES.find((p) => p.slug === slug);
  return {
    title: policy?.title ?? "Policy",
    description: policy?.intro,
  };
}

export default async function PolicyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const policy = POLICIES.find((p) => p.slug === slug);
  if (!policy) notFound();

  return (
    <div className="shell py-12 lg:py-16">
      <div className="grid gap-12 lg:grid-cols-[0.65fr_1.35fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">Policies</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-ink">{policy.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">{policy.intro}</p>
          <nav className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
            {POLICIES.map((item) => (
              <Link
                key={item.slug}
                href={`/policies/${item.slug}`}
                className={
                  item.slug === policy.slug
                    ? "block text-rose-deep"
                    : "block text-muted hover:text-espresso"
                }
              >
                {item.title}
              </Link>
            ))}
          </nav>
          <p className="mt-6 text-[11px] uppercase tracking-[0.14em] text-muted">
            Updated {policy.updated}
          </p>
        </aside>

        <article className="max-w-2xl">
          {policy.sections.map((section) => (
            <section key={section.heading} className="mb-9">
              <h2 className="font-display text-2xl text-ink">{section.heading}</h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-muted">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <div className="mt-10 rounded-xl bg-shell p-5 text-sm text-muted">
            <p>
              Still unsure? Message us on WhatsApp or email{" "}
              <a
                href="mailto:femmebeautybysyl@gmail.com"
                className="text-espresso underline decoration-rose/50 underline-offset-4"
              >
                femmebeautybysyl@gmail.com
              </a>{" "}
              — a human reads every message.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/book" className="btn-rose btn-sm">
              Book an appointment
            </Link>
            <Link href="/contact" className="btn-outline btn-sm">
              Contact the studio
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
