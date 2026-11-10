import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Studio login",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/admin");

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden overflow-hidden bg-ink px-12 py-14 text-cream lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-20 select-none font-script text-[24rem] leading-none text-white/5"
        >
          Femme
        </div>
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-script text-4xl text-cream">Femme</span>
          <span className="mt-1.5 pl-1 text-[8px] uppercase tracking-[0.42em] text-cream/50">
            beauty hairs
          </span>
        </Link>

        <div className="relative max-w-md">
          <p className="text-[11px] uppercase tracking-[0.3em] text-rose-light/70">
            The studio dashboard
          </p>
          <p className="mt-4 font-display text-4xl leading-tight">
            Your calendar, your clients, your numbers — in one quiet place.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-cream/50">
            Confirm requests, take deposits, move appointments and keep the day moving. Built for
            the phone in your hand, not a desk you don&apos;t have.
          </p>
        </div>

        <p className="text-[11px] uppercase tracking-[0.2em] text-cream/30">
          16 Shiro Street · Fadeyi, Lagos
        </p>
      </div>

      <div className="flex items-center justify-center px-5 py-14">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Link href="/" className="flex flex-col leading-none">
              <span className="font-script text-4xl text-espresso">Femme</span>
              <span className="mt-1.5 pl-1 text-[8px] uppercase tracking-[0.42em] text-muted">
                beauty hairs
              </span>
            </Link>
          </div>

          <h1 className="mt-8 font-display text-4xl text-ink lg:mt-0">Welcome back.</h1>
          <p className="mt-2 text-sm text-muted">Sign in to manage appointments and orders.</p>

          <div className="mt-8">
            <LoginForm />
          </div>

          <p className="mt-6 text-[11px] leading-relaxed text-muted">
            Only studio staff have accounts. Forgot the password? Ask whoever set the site up — it
            can be reset from the server.
          </p>

          <Link
            href="/"
            className="mt-8 inline-block text-xs text-muted underline decoration-line underline-offset-4 hover:text-espresso"
          >
            ← Back to the website
          </Link>
        </div>
      </div>
    </div>
  );
}
