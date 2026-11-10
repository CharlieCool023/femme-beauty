"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Plus } from "lucide-react";
import { createAppointmentAction, type ActionState } from "@/app/admin/actions";
import { formatTime } from "@/lib/time";

const initial: ActionState = {};

type ServiceOption = {
  id: string;
  name: string;
  durationMin: number;
  price: number;
  depositPct: number | null;
};

type Slot = { time: string; minutes: number };

function Submit({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} className="btn-primary">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      Add appointment
    </button>
  );
}

export function ManualAppointmentForm({
  services,
  today,
  depositPct,
}: {
  services: ServiceOption[];
  today: string;
  depositPct: number;
}) {
  const [state, formAction] = useActionState(createAppointmentAction, initial);
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState(today);
  const [minutes, setMinutes] = useState<number>(-1);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const service = services.find((item) => item.id === serviceId);

  useEffect(() => {
    if (!serviceId || !date) return;
    let active = true;
    setLoading(true);
    setMinutes(-1);
    setSlots([]);
    setMessage(null);

    fetch(`/api/availability?serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(date)}`, {
      cache: "no-store",
    })
      .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (!active) return;
        if (!ok) {
          setMessage(data.error ?? "Could not load times.");
          return;
        }
        setSlots(data.slots ?? []);
        if (!data.slots?.length) {
          setMessage(data.closed ? "Closed that day." : "No free slots that day.");
        }
      })
      .catch(() => active && setMessage("Could not load times."))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [serviceId, date]);

  const pct = service?.depositPct ?? depositPct;
  const deposit = service ? Math.round((service.price * pct) / 100 / 100) * 100 : 0;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="minutes" value={minutes} />

      <section className="rounded-xl border border-line bg-white/70 p-4">
        <h2 className="text-sm font-medium text-ink">Client</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="label">
              Full name
            </label>
            <input id="name" name="name" className="field" required />
          </div>
          <div>
            <label htmlFor="phone" className="label">
              Phone
            </label>
            <input id="phone" name="phone" className="field" inputMode="tel" required />
          </div>
          <div>
            <label htmlFor="email" className="label">
              Email <span className="normal-case tracking-normal text-muted/60">(optional)</span>
            </label>
            <input id="email" name="email" type="email" className="field" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="note" className="label">
              Note
            </label>
            <input id="note" name="note" className="field" placeholder="What she asked for on the phone…" />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-white/70 p-4">
        <h2 className="text-sm font-medium text-ink">When</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="service" className="label">
              Service
            </label>
            <select
              id="service"
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
              className="field"
            >
              {services.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {item.durationMin} min
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date" className="label">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              min={today}
              onChange={(event) => setDate(event.target.value)}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="slot" className="label">
              Time
            </label>
            <select
              id="slot"
              value={minutes}
              onChange={(event) => setMinutes(Number(event.target.value))}
              className="field"
              disabled={loading || slots.length === 0}
            >
              <option value={-1}>{loading ? "Checking…" : "Choose a time"}</option>
              {slots.map((slot) => (
                <option key={slot.minutes} value={slot.minutes}>
                  {formatTime(slot.minutes)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {message && <p className="mt-3 text-[11px] text-rose-deep">{message}</p>}

        {service && (
          <p className="mt-3 text-[11px] text-muted">
            {service.name} · {service.durationMin} minutes · price ₦{service.price.toLocaleString("en-US")}
            {" · "}deposit ₦{deposit.toLocaleString("en-US")} ({pct}%)
          </p>
        )}
      </section>

      <section className="rounded-xl border border-line bg-white/70 p-4">
        <label className="flex items-center gap-2 text-sm text-ink/80">
          <input type="checkbox" name="depositPaid" className="h-4 w-4 accent-[#9e6353]" />
          Deposit already received (cash / transfer)
        </label>
        <p className="mt-1.5 text-[11px] text-muted">
          The appointment is created as confirmed and a confirmation message is queued in the outbox.
        </p>
      </section>

      {state.error && (
        <p className="rounded-lg border border-rose-deep/30 bg-rose-deep/5 px-3 py-2 text-xs text-rose-deep">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Submit disabled={minutes < 0 || loading} />
        <Link href="/admin/appointments" className="text-xs text-muted hover:text-ink">
          Cancel
        </Link>
      </div>
    </form>
  );
}
