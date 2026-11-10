"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Image as ImageIcon,
  Package,
  Scissors,
  Settings,
  ShoppingBag,
  Store,
  Users,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { cn, initials } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badge?: number;
};

export function AdminShell({
  user,
  pendingCount,
  queuedCount,
  children,
}: {
  user: { name: string; email: string };
  pendingCount: number;
  queuedCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const nav: NavItem[] = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
    { href: "/admin/appointments", label: "Appointments", icon: ClipboardList, badge: pendingCount },
    { href: "/admin/services", label: "Services", icon: Scissors },
    { href: "/admin/products", label: "Products", icon: ShoppingBag },
    { href: "/admin/images", label: "Images", icon: ImageIcon },
    { href: "/admin/orders", label: "Orders", icon: Package },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/outbox", label: "Outbox", icon: Inbox, badge: queuedCount },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/admin" className="flex flex-col leading-none">
          <span className="font-script text-3xl text-espresso">Femme</span>
          <span className="mt-1 pl-0.5 text-[7px] uppercase tracking-[0.4em] text-muted">
            studio desk
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-muted lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {nav.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition",
                active
                  ? "bg-ink text-cream"
                  : "text-ink/65 hover:bg-white/70 hover:text-ink",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px]",
                    active ? "bg-cream/20 text-cream" : "bg-rose-deep/10 text-rose-deep",
                  )}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-line p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-ink/65 hover:bg-white/70 hover:text-ink"
        >
          <Store className="h-4 w-4" /> View website
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-ink/65 hover:bg-white/70 hover:text-ink"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </form>

        <div className="mt-2 flex items-center gap-2.5 rounded-lg bg-white/60 px-3 py-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-deep text-[11px] text-white">
            {initials(user.name)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[12px] text-ink">{user.name}</span>
            <span className="block truncate text-[10px] text-muted">{user.email}</span>
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f1ec]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-line bg-[#fbf6f1] lg:block">
        {sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-line bg-[#fbf6f1]">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-[#f7f1ec]/90 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <span className="font-script text-2xl text-espresso">Femme</span>
          <span className="h-9 w-9 rounded-full bg-rose-deep text-center text-[11px] leading-9 text-white">
            {initials(user.name)}
          </span>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
