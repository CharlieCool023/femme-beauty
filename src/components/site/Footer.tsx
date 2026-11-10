import Link from "next/link";
import { Instagram, Mail, MapPin, Music2, Phone } from "lucide-react";
import type { Settings } from "@/lib/settings";

const SHOP_LINKS = [
  { href: "/shop?category=Wigs", label: "Wigs" },
  { href: "/shop?category=Hair", label: "Raw hair" },
  { href: "/shop?category=Nails", label: "Nails" },
  { href: "/shop?category=Lashes", label: "Lashes" },
  { href: "/shop?category=Accessories", label: "Accessories" },
];

const STUDIO_LINKS = [
  { href: "/services", label: "Service menu" },
  { href: "/book", label: "Book an appointment" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About Femme" },
  { href: "/contact", label: "Visit the studio" },
];

const LEGAL_LINKS = [
  { href: "/policies/cancellation", label: "Booking policy" },
  { href: "/policies/delivery", label: "Delivery & returns" },
  { href: "/policies/privacy", label: "Privacy" },
  { href: "/policies/terms", label: "Terms" },
];

export function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="mt-24 border-t border-line bg-shell">
      <div className="shell py-14 pb-24 sm:py-16 sm:pb-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Link href="/" className="inline-flex flex-col leading-none">
              <span className="font-script text-4xl text-espresso">Femme</span>
              <span className="mt-1.5 pl-1 text-[8px] font-medium uppercase tracking-[0.42em] text-muted">
                beauty hairs
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              {settings.tagline} Custom wigs, raw hair, hand-finished nails and lashes — made in
              Lagos, booked online.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <a
                href={settings.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-espresso hover:text-rose-deep"
              >
                <Instagram className="h-4 w-4" />
                {settings.instagramHandle}
              </a>
              {settings.tiktok && (
                <a
                  href={settings.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-espresso hover:text-rose-deep"
                >
                  <Music2 className="h-4 w-4" />
                  {settings.tiktokHandle || "TikTok"}
                </a>
              )}
            </div>
          </div>

          <FooterColumn title="Shop" links={SHOP_LINKS} />
          <FooterColumn title="Studio" links={STUDIO_LINKS} />

          <div>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso">
              Visit
            </h3>
            <ul className="space-y-3 text-sm text-muted">
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
                <span>{settings.address}</span>
              </li>
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
                <span>
                  <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="block hover:text-espresso">
                    {settings.phone}
                  </a>
                  {settings.phoneAlt && (
                    <a href={`tel:${settings.phoneAlt.replace(/\s/g, "")}`} className="block hover:text-espresso">
                      {settings.phoneAlt}
                    </a>
                  )}
                </span>
              </li>
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
                <a href={`mailto:${settings.email}`} className="hover:text-espresso">
                  {settings.email}
                </a>
              </li>
            </ul>
            <p className="mt-5 text-xs leading-relaxed text-muted/80">
              Mon–Sat, 9am–7pm
              <br />
              Sunday, closed
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-line pt-7 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Femme Beauty. All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-espresso">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/admin" className="hover:text-espresso">
                Studio login
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso">
        {title}
      </h3>
      <ul className="space-y-2.5 text-sm text-muted">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="transition-colors hover:text-espresso">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
