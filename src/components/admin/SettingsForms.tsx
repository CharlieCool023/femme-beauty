"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import {
  addTimeOffAction,
  saveHoursAction,
  saveSettingsAction,
  type ActionState,
} from "@/app/admin/actions";

const initial: ActionState = {};

function Submit({ label = "Save changes" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary btn-sm">
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

export function BusinessSettingsForm({ values }: { values: Record<string, string> }) {
  const [state, formAction] = useActionState(saveSettingsAction, initial);

  return (
    <form action={formAction} className="space-y-5">
      <section className="rounded-xl border border-line bg-white/70 p-4">
        <h2 className="text-sm font-medium text-ink">The business</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Business name" name="businessName" value={values.businessName} />
          <Field label="Legal name" name="legalName" value={values.legalName} />
          <Field label="Tagline" name="tagline" value={values.tagline} className="sm:col-span-2" />
          <Field label="Phone" name="phone" value={values.phone} />
          <Field label="Second phone" name="phoneAlt" value={values.phoneAlt} />
          <Field label="WhatsApp (digits)" name="whatsapp" value={values.whatsapp} />
          <Field label="Email" name="email" value={values.email} type="email" />
          <Field label="Instagram URL" name="instagram" value={values.instagram} />
          <Field label="Instagram handle" name="instagramHandle" value={values.instagramHandle} />
          <Field label="TikTok URL" name="tiktok" value={values.tiktok} />
          <Field label="TikTok handle" name="tiktokHandle" value={values.tiktokHandle} />
          <Field label="Address" name="address" value={values.address} className="sm:col-span-2" />
          <Field label="Area / short location" name="area" value={values.area} />
          <Field label="Google Maps query" name="mapsQuery" value={values.mapsQuery} />
          <div className="sm:col-span-2">
            <label htmlFor="aboutStory" className="label">
              About story
            </label>
            <textarea
              id="aboutStory"
              name="aboutStory"
              defaultValue={values.aboutStory}
              className="field min-h-[110px] resize-y"
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-white/70 p-4">
        <h2 className="text-sm font-medium text-ink">Bookings & deposits</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Field label="Deposit %" name="depositPct" value={values.depositPct} type="number" />
          <Field label="Hold window (minutes)" name="holdMinutes" value={values.holdMinutes} type="number" />
          <Field label="Cancellation notice (hours)" name="cancellationHours" value={values.cancellationHours} type="number" />
          <div className="sm:col-span-3">
            <label htmlFor="bookingNote" className="label">
              Booking note (shows on contact page)
            </label>
            <input id="bookingNote" name="bookingNote" defaultValue={values.bookingNote} className="field" />
          </div>
        </div>

        <h3 className="mt-5 text-[11px] uppercase tracking-[0.16em] text-muted">Deposit account</h3>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          <Field label="Bank" name="bankName" value={values.bankName} />
          <Field label="Account name" name="accountName" value={values.accountName} />
          <Field label="Account number" name="accountNumber" value={values.accountNumber} />
        </div>

        <div className="mt-4">
          <label htmlFor="deliveryNote" className="label">
            Delivery note
          </label>
          <textarea
            id="deliveryNote"
            name="deliveryNote"
            defaultValue={values.deliveryNote}
            className="field min-h-[70px] resize-y"
          />
        </div>
      </section>

      {state.success && <p className="text-xs text-[#3f6b45]">{state.success}</p>}
      {state.error && <p className="text-xs text-rose-deep">{state.error}</p>}

      <Submit label="Save settings" />
    </form>
  );
}

function Field({
  label,
  name,
  value,
  type = "text",
  className,
}: {
  label: string;
  name: string;
  value: string;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <input id={name} name={name} type={type} defaultValue={value} className="field" />
    </div>
  );
}

type HourRow = { weekday: number; open: string; close: string; closed: boolean };

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function HoursForm({ rows }: { rows: HourRow[] }) {
  const [state, formAction] = useActionState(saveHoursAction, initial);

  return (
    <form action={formAction} className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-line bg-white/70">
        {rows.map((row) => (
          <div
            key={row.weekday}
            className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-line px-4 py-2.5 last:border-b-0 sm:grid-cols-[1fr_auto_auto_auto]"
          >
            <p className="text-[13px] text-ink">{DAY_LABELS[row.weekday]}</p>
            <label className="flex items-center gap-1.5 text-[11px] text-muted">
              <input
                type="checkbox"
                name={`closed_${row.weekday}`}
                defaultChecked={row.closed}
                className="h-3.5 w-3.5 accent-[#9e6353]"
              />
              Closed
            </label>
            <input
              type="time"
              name={`open_${row.weekday}`}
              defaultValue={row.open}
              step={900}
              className="field w-[104px] py-1.5 text-[12px]"
            />
            <input
              type="time"
              name={`close_${row.weekday}`}
              defaultValue={row.close}
              step={900}
              className="field w-[104px] py-1.5 text-[12px]"
            />
          </div>
        ))}
      </div>

      {state.success && <p className="text-xs text-[#3f6b45]">{state.success}</p>}
      {state.error && <p className="text-xs text-rose-deep">{state.error}</p>}

      <Submit label="Save hours" />
    </form>
  );
}

export function TimeOffForm({ today }: { today: string }) {
  const [state, formAction] = useActionState(addTimeOffAction, initial);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_auto_auto_1.4fr_auto] sm:items-end">
      <div>
        <label htmlFor="timeoff-date" className="label">
          Date
        </label>
        <input id="timeoff-date" type="date" name="date" defaultValue={today} className="field py-2" required />
      </div>
      <div>
        <label htmlFor="timeoff-start" className="label">
          From
        </label>
        <input id="timeoff-start" type="time" name="startTime" defaultValue="09:00" step={900} className="field w-[104px] py-2" />
      </div>
      <div>
        <label htmlFor="timeoff-end" className="label">
          To
        </label>
        <input id="timeoff-end" type="time" name="endTime" defaultValue="19:00" step={900} className="field w-[104px] py-2" />
      </div>
      <div>
        <label htmlFor="timeoff-reason" className="label">
          Reason
        </label>
        <input id="timeoff-reason" name="reason" placeholder="e.g. travelling" className="field py-2" />
      </div>
      <button type="submit" className="btn-outline btn-sm">
        Block time
      </button>
      {state.error && <p className="text-xs text-rose-deep sm:col-span-5">{state.error}</p>}
      {state.success && <p className="text-xs text-[#3f6b45] sm:col-span-5">{state.success}</p>}
    </form>
  );
}
