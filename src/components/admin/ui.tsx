import { cn } from "@/lib/utils";

const APPOINTMENT_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "New request", className: "bg-[#fdf3dd] text-[#8a6412]" },
  AWAITING_DEPOSIT: { label: "Awaiting deposit", className: "bg-blush text-rose-deep" },
  CONFIRMED: { label: "Confirmed", className: "bg-[#e8f2e9] text-[#3f6b45]" },
  COMPLETED: { label: "Completed", className: "bg-[#eef0f2] text-[#4c5a63]" },
  CANCELLED: { label: "Cancelled", className: "bg-[#f0eeec] text-[#8a7c74]" },
  NO_SHOW: { label: "No-show", className: "bg-[#fbe4e0] text-[#a03f31]" },
};

const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  NEW: { label: "New enquiry", className: "bg-[#fdf3dd] text-[#8a6412]" },
  CONTACTED: { label: "Contacted", className: "bg-blush text-rose-deep" },
  PAID: { label: "Paid", className: "bg-[#e8f2e9] text-[#3f6b45]" },
  DELIVERED: { label: "Delivered", className: "bg-[#eef0f2] text-[#4c5a63]" },
  CLOSED: { label: "Closed", className: "bg-[#f0eeec] text-[#8a7c74]" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = APPOINTMENT_STATUS[status] ?? {
    label: status,
    className: "bg-line/50 text-muted",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em]",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

export function OrderBadge({ status }: { status: string }) {
  const config = ORDER_STATUS[status] ?? { label: status, className: "bg-line/50 text-muted" };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em]",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "rose" | "ink" | "green";
}) {
  return (
    <div className="rounded-xl border border-line bg-white/70 p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{label}</p>
      <p
        className={cn(
          "mt-2 font-display text-3xl leading-none",
          accent === "rose" && "text-rose-deep",
          accent === "green" && "text-[#3f6b45]",
          (!accent || accent === "ink") && "text-ink",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-2 text-[11px] leading-snug text-muted">{hint}</p>}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line px-6 py-10 text-center">
      <p className="font-display text-xl text-espresso">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
