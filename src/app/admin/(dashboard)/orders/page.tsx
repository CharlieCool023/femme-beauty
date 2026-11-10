import { prisma } from "@/lib/db";
import { money } from "@/lib/format";
import { formatDateTime } from "@/lib/time";
import { whatsappLink } from "@/lib/utils";
import { PageHeader, OrderBadge, EmptyState } from "@/components/admin/ui";
import { updateOrderStatusAction } from "@/app/admin/actions";
import { MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUSES = ["NEW", "CONTACTED", "PAID", "DELIVERED", "CLOSED"];

export default async function OrdersPage() {
  const orders = await prisma.orderIntent.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const newCount = orders.filter((o) => o.status === "NEW").length;

  return (
    <div>
      <PageHeader
        title="Shop orders"
        subtitle={`${orders.length} WhatsApp enquiries · ${newCount} waiting for a reply`}
      />

      {orders.length === 0 ? (
        <EmptyState
          title="No product enquiries yet"
          body="When someone taps “Order on WhatsApp” on a product, the item is logged here so you know what was asked for — even if the chat happens on your phone."
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-line bg-white/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-ink">{order.productName}</p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {order.variant ? `${order.variant} · ` : ""}
                    {order.amount ? money(order.amount) : "Price on request"} ·{" "}
                    {formatDateTime(order.createdAt)}
                  </p>
                  {(order.customerName || order.phone) && (
                    <p className="mt-1 text-[11px] text-ink/70">
                      {order.customerName} {order.phone ? `· ${order.phone}` : ""}
                    </p>
                  )}
                  {order.note && <p className="mt-1 text-[11px] text-muted">“{order.note}”</p>}
                </div>
                <OrderBadge status={order.status} />
              </div>

              <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-line pt-3">
                <form action={updateOrderStatusAction} className="flex items-end gap-2">
                  <input type="hidden" name="id" value={order.id} />
                  <div>
                    <label htmlFor={`status-${order.id}`} className="label">
                      Mark as
                    </label>
                    <select
                      id={`status-${order.id}`}
                      name="status"
                      defaultValue={order.status}
                      className="field py-1.5 text-[12px]"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn-outline btn-sm">
                    Update
                  </button>
                </form>

                {order.phone && (
                  <a
                    href={whatsappLink(
                      order.phone,
                      `Hi${order.customerName ? ` ${order.customerName}` : ""}, it's Femme Beauty about the ${order.productName}.`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-rose btn-sm"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Reply
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-5 text-[11px] leading-relaxed text-muted">
        Enquiries are logged when a customer taps the WhatsApp button — no cart, no checkout. Reply
        in chat, then move the status along so your dashboard stays honest.
      </p>
    </div>
  );
}
