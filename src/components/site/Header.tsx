"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header({ phone }: { phone: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="bg-ink text-cream/85">
        <div className="shell flex h-9 items-center justify-between text-[11px] tracking-[0.14em] uppercase">
          <span className="flex min-w-0 items-center gap-1.5">
            <MapPin className="h-3 w-3 shrink-0 text-rose-light" />
            <span className="truncate sm:hidden">Fadeyi, Lagos</span>
            <span className="hidden truncate sm:inline">16 Shiro Street, Fadeyi, Lagos</span>
          </span>
          <span className="hidden sm:block">Appointments only · Mon–Sat, 9am–7pm</span>
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-white">
            {phone}
          </a>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-all duration-300",
          scrolled
            ? "border-line bg-cream/90 backdrop-blur-md"
            : "border-transparent bg-cream/80 backdrop-blur-sm",
        )}
      >
        <div className="shell flex h-[72px] items-center justify-between gap-6">
          <Link href="/" className="group flex flex-col leading-none" aria-label="Femme Beauty home">
            <span className="font-script text-[32px] leading-[0.9] text-espresso transition-colors group-hover:text-rose-deep">
              Femme
            </span>
            <span className="mt-1 pl-1 text-[8px] font-medium uppercase tracking-[0.42em] text-muted">
              beauty hairs
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-[13px] tracking-[0.06em] transition-colors hover:text-rose-deep",
                    active ? "text-rose-deep" : "text-ink/75",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/book" className="btn-rose btn-sm">
              Book an appointment
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-x-0 bottom-0 top-[108px] z-40 overflow-y-auto bg-cream md:hidden">
          <div className="shell flex flex-col gap-1 py-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-line/70 py-4 font-display text-2xl text-espresso"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/book" className="btn-rose mt-6">
              Book an appointment
            </Link>
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="mt-3 text-center text-sm text-muted">
              Call {phone}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
