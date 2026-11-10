import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/time";
import { whatsappLink } from "@/lib/utils";
import { PageHeader, EmptyState } from "@/components/admin/ui";
import { markNotificationSentAction } from "@/app/admin/actions";
import { Check, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Search = Promise<{ status?: string; channel?: string }>;

export default async function OutboxPage({ searchParams }: { searchParams: Search }) {
  const { status = "QUEUED", channel } = await searchParams;

  const notifications = await prisma.notification.findMany({
    where: {
      ...(status !== "ALL" ? { status } : {}),
      ...(channel && channel !== "ALL" ? { channel } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const tabs = [
    { value: "QUEUED", label: "Queued" },
    { value: "SENT", label: "Sent" },
    { value: "ALL", label: "All" },
  ];

  return (
    <div>
      <PageHeader
        title="Outbox"
        subtitle="Every confirmation and deposit request, ready to send. Tap through to WhatsApp, then mark it sent."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-1.5">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={`/admin/outbox?status=${tab.value}${channel ? `&channel=${channel}` : ""}`}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px]",
                status === tab.value
                  ? "border-ink bg-ink text-cream"
                  : "border-line bg-white/60 text-ink/70 hover:border-ink/30",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex gap-1.5">
          {["ALL", "WHATSAPP", "EMAIL"].map((option) => (
            <Link
              key={option}
              href={`/admin/outbox?status=${status}${option !== "ALL" ? `&channel=${option}` : ""}`}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.1em]",
                (channel ?? "ALL") === option
                  ? "border-rose-deep bg-blush text-rose-deep"
                  : "border-line text-muted hover:border-ink/30",
              )}
            >
              {option === "ALL" ? "All channels" : option}
            </Link>
          ))}
        </div>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="Nothing waiting"
          body="Messages appear here when a booking comes in, a deposit is requested, or an appointment is confirmed."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div key={notification.id} className="rounded-xl border border-line bg-white/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted">
                    {notification.channel} → {notification.to}
                  </p>
                  <p className="mt-1 text-sm text-ink">{notification.subject ?? "Message"}</p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.08em]",
                    notification.status === "SENT"
                      ? "bg-[#e8f2e9] text-[#3f6b45]"
                      : "bg-blush text-rose-deep",
                  )}
                >
                  {notification.status.toLowerCase()}
                </span>
              </div>

              <details className="group mt-2">
                <summary className="cursor-pointer list-none text-[11px] text-muted hover:text-espresso">
                  Read the message
                </summary>
                <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-shell p-3 text-[11px] leading-relaxed text-ink/80">
                  {notification.body}
                </pre>
              </details>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                {notification.channel === "WHATSAPP" ? (
                  <a
                    href={whatsappLink(notification.to, notification.body)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-rose btn-sm"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Open in WhatsApp
                  </a>
                ) : (
                  <a
                    href={`mailto:${notification.to}?subject=${encodeURIComponent(
                      notification.subject ?? "Femme Beauty",
                    )}&body=${encodeURIComponent(notification.body)}`}
                    className="btn-rose btn-sm"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Open in email
                  </a>
                )}
                {notification.status !== "SENT" && (
                  <form action={markNotificationSentAction}>
                    <input type="hidden" name="id" value={notification.id} />
                    <button type="submit" className="btn-outline btn-sm">
                      <Check className="h-3.5 w-3.5" /> Mark sent
                    </button>
                  </form>
                )}
                <span className="ml-auto text-[10px] text-muted">{formatDateTime(notification.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-line bg-white/60 p-4 text-[11px] leading-relaxed text-muted">
        <p className="font-medium text-espresso">How sending works today</p>
        <p className="mt-1">
          Nothing is sent automatically yet — that&apos;s deliberate, so no client gets a half-written
          message. Open the message in WhatsApp, send it, then mark it sent here. When you&apos;re
          ready, an email provider and the WhatsApp Business API can be connected to send these
          automatically without changing anything else.
        </p>
      </div>
    </div>
  );
}
