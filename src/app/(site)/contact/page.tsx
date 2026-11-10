import Link from "next/link";
import type { Metadata } from "next";
import { Clock, Instagram, Mail, MapPin, MessageCircle, Music2, Phone } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { FAQS } from "@/lib/content";
import { whatsappLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Visit & contact",
  description:
    "Find Femme Beauty at 16 Shiro Street, Ajib, Fadeyi, Lagos. Message us on WhatsApp on +234 806 389 6895.",
};

export default async function ContactPage() {
  const settings = await getSettings();

  const cards = [
    {
      icon: MapPin,
      label: "The studio",
      value: settings.address,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.mapsQuery)}`,
    },
    {
      icon: Phone,
      label: "Call",
      value: settings.phone,
      href: `tel:${settings.phone.replace(/\s/g, "")}`,
    },
    ...(settings.phoneAlt
      ? [
          {
            icon: Phone,
            label: "Second line",
            value: settings.phoneAlt,
            href: `tel:${settings.phoneAlt.replace(/\s/g, "")}`,
          },
        ]
      : []),
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: "Message the studio",
      href: whatsappLink(settings.whatsapp, "Hi Femme Beauty! I have a question."),
    },
    {
      icon: Mail,
      label: "Email",
      value: settings.email,
      href: `mailto:${settings.email}`,
    },
    {
      icon: Instagram,
      label: "Instagram",
      value: settings.instagramHandle,
      href: settings.instagram,
    },
    ...(settings.tiktok
      ? [
          {
            icon: Music2,
            label: "TikTok",
            value: settings.tiktokHandle || "Beauty by Sylvia",
            href: settings.tiktok,
          },
        ]
      : []),
  ];

  return (
    <div className="shell py-12 lg:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow">Visit</p>
        <h1 className="mt-3 font-display text-5xl leading-tight text-ink sm:text-6xl">
          Find us in Fadeyi.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Appointments only, Monday to Saturday. Message us on WhatsApp for the fastest reply —
          we&apos;re usually in the chair, so voice notes and texts work best.
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <ul className="divide-y divide-line border-y border-line">
            {cards.map((card) => (
              <li key={card.label}>
                <a
                  href={card.href}
                  target={card.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="group flex items-center gap-4 py-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-shell text-rose-deep">
                    <card.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-[0.16em] text-muted">
                      {card.label}
                    </span>
                    <span className="block truncate text-sm text-ink group-hover:text-rose-deep">
                      {card.value}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-7 rounded-2xl bg-shell p-5">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted">
              <Clock className="h-3.5 w-3.5 text-rose-deep" /> Opening hours
            </p>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Monday – Friday</dt>
                <dd className="text-ink">9:00am – 7:00pm</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Saturday</dt>
                <dd className="text-ink">9:00am – 7:00pm</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Sunday</dt>
                <dd className="text-ink">Closed</dd>
              </div>
            </dl>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              {settings.bookingNote} Last appointment starts 2 hours before close.
            </p>
          </div>

          <Link href="/book" className="btn-rose mt-6 w-full justify-center">
            Book an appointment
          </Link>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-line">
          <iframe
            title="Femme Beauty location map"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(settings.mapsQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            className="h-[320px] w-full lg:h-full lg:min-h-[520px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-4xl text-ink">Questions, answered.</h2>
        <div className="mt-6 divide-y divide-line border-y border-line">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-espresso">
                {faq.q}
                <span className="text-xl font-light text-muted transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
