"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Loader2,
  MapPin,
  PenLine,
  Sparkles,
} from "lucide-react";
import { money } from "@/lib/format";
import { cn, whatsappLink } from "@/lib/utils";
import { durationLabel, formatDateShort, formatTime, todayStr } from "@/lib/time";

type ServiceOption = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  durationMin: number;
  price: number;
  depositPct: number | null;
};

type DayOption = { date: string; open: boolean };
type Slot = { time: string; minutes: number; iso: string };

type Props = {
  services: ServiceOption[];
  customService: { id: string; name: string; durationMin: number };
  customCategories: string[];
  days: DayOption[];
  initialServiceId: string | null;
  initialMode?: "service" | "custom";
  staffId: string | null;
  staffName: string;
  depositPct: number;
  holdMinutes: number;
  whatsapp: string;
  address: string;
};

const STEPS = ["Service", "Time", "Details", "Confirm"];

export function BookingFlow({
  services,
  customService,
  customCategories,
  days,
  initialServiceId,
  initialMode = "service",
  staffId,
  staffName,
  depositPct,
  holdMinutes,
  whatsapp,
  address,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"service" | "custom">(initialMode);
  const [serviceId, setServiceId] = useState<string | null>(initialServiceId);
  const [filter, setFilter] = useState<string>("All");
  const [customCategory, setCustomCategory] = useState<string>(customCategories[0] ?? "Something else");
  const [brief, setBrief] = useState("");
  const [budget, setBudget] = useState("");
  const [date, setDate] = useState<string>(
    days.find((day) => day.open)?.date ?? days[0]?.date ?? todayStr(),
  );
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", note: "", consent: false });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const service = useMemo(
    () => services.find((item) => item.id === serviceId) ?? null,
    [services, serviceId],
  );

  const customDisplay: ServiceOption = useMemo(
    () => ({
      id: customService.id,
      slug: "custom-request",
      name: `Custom request${customCategory ? ` · ${customCategory}` : ""}`,
      category: customCategory || "Custom",
      description: null,
      durationMin: customService.durationMin,
      price: 0,
      depositPct: 0,
    }),
    [customService, customCategory],
  );

  const active: ServiceOption | null = mode === "custom" ? customDisplay : service;
  const isCustom = mode === "custom";

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(services.map((item) => item.category)))],
    [services],
  );

  const visibleServices = useMemo(
    () => (filter === "All" ? services : services.filter((item) => item.category === filter)),
    [services, filter],
  );

  const deposit = active
    ? Math.round((active.price * (active.depositPct ?? depositPct)) / 100 / 100) * 100
    : 0;
  const effectivePct = active?.depositPct ?? depositPct;

  const loadSlots = useCallback(
    async (serviceIdValue: string, dateValue: string) => {
      setSlotsLoading(true);
      setSlotError(null);
      setMinutes(null);
      try {
        const res = await fetch(
          `/api/availability?serviceId=${encodeURIComponent(serviceIdValue)}&date=${encodeURIComponent(
            dateValue,
          )}${staffId ? `&staffId=${staffId}` : ""}`,
          { cache: "no-store" },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not load times");
        setSlots(data.slots ?? []);
      } catch (err) {
        setSlots([]);
        setSlotError(err instanceof Error ? err.message : "Could not load times");
      } finally {
        setSlotsLoading(false);
      }
    },
    [staffId],
  );

  useEffect(() => {
    if (step === 1 && active?.id) void loadSlots(active.id, date);
  }, [step, active?.id, date, loadSlots]);

  function chooseMode(next: "service" | "custom") {
    setMode(next);
    setMinutes(null);
    setError(null);
  }

  const briefReady = brief.trim().length >= 10;

  async function submit() {
    if (!active || minutes === null) return;
    if (!form.name.trim() || form.phone.replace(/\D/g, "").length < 10) {
      setError("Please add your name and a valid phone number.");
      return;
    }
    if (!form.consent) {
      setError("Please agree to the booking policy to continue.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        date,
        minutes,
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        note: form.note || undefined,
      };

      const res = await fetch(isCustom ? "/api/custom-request" : "/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isCustom
            ? {
                ...payload,
                category: customCategory,
                brief,
                budget: budget ? Number(budget) : undefined,
              }
            : { ...payload, serviceId: active.id, staffId },
        ),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Booking failed");
      router.push(`/booking/${data.reference}?new=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const canContinueFromService = isCustom ? briefReady : Boolean(service);
  const canContinueFromTime = minutes !== null;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Progress */}
      <ol className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.14em] sm:gap-4">
        {STEPS.map((label, index) => {
          const activeStep = index === step;
          const done = index < step;
          return (
            <li key={label} className="flex items-center gap-1.5 sm:gap-2">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border text-[10px]",
                  activeStep && "border-ink bg-ink text-cream",
                  done && "border-rose-deep bg-rose-deep text-white",
                  !activeStep && !done && "border-line text-muted",
                )}
              >
                {done ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              <span className={cn(activeStep ? "text-ink" : "text-muted", "hidden sm:inline")}>
                {label}
              </span>
              {index < STEPS.length - 1 && <span className="mx-0.5 h-px w-3 bg-line sm:mx-1 sm:w-8" />}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[1.35fr_0.65fr] lg:gap-8">
        <div className="card p-4 sm:p-7">
          {step === 0 && (
            <div>
              <h2 className="font-display text-2xl text-ink sm:text-3xl">What can we do for you?</h2>
              <p className="mt-1.5 text-sm text-muted">
                Book something from the menu, or tell us what you have in mind.
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => chooseMode("service")}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 text-left transition",
                    !isCustom
                      ? "border-ink bg-ink/[0.03] ring-1 ring-ink"
                      : "border-line hover:border-rose/60",
                  )}
                >
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-rose-deep" />
                  <span>
                    <span className="block text-sm font-medium text-ink">Book a service</span>
                    <span className="block text-[11px] leading-snug text-muted">
                      Installs, braids, nails, lashes, gele, makeup
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => chooseMode("custom")}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 text-left transition",
                    isCustom
                      ? "border-rose-deep bg-rose-deep/[0.04] ring-1 ring-rose-deep"
                      : "border-line hover:border-rose/60",
                  )}
                >
                  <PenLine className="mt-0.5 h-4 w-4 shrink-0 text-rose-deep" />
                  <span>
                    <span className="block text-sm font-medium text-ink">Request something custom</span>
                    <span className="block text-[11px] leading-snug text-muted">
                      Hair making, fixing, gele, nails — describe it
                    </span>
                  </span>
                </button>
              </div>

              {!isCustom ? (
                <>
                  <div className="no-scrollbar mt-5 flex snap-x gap-2 overflow-x-auto pb-1">
                    {categories.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setFilter(item)}
                        className={cn(
                          "shrink-0 snap-start rounded-full border px-3.5 py-1.5 text-[11px] tracking-wide transition",
                          filter === item
                            ? "border-ink bg-ink text-cream"
                            : "border-line text-ink/70 hover:border-ink/40",
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {visibleServices.map((item) => {
                      const selected = item.id === serviceId;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setServiceId(item.id);
                            setMinutes(null);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition sm:p-4",
                            selected
                              ? "border-rose-deep bg-rose-deep/[0.04] ring-1 ring-rose-deep"
                              : "border-line hover:border-rose/60 hover:bg-shell/50",
                          )}
                        >
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-ink">{item.name}</span>
                            <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted">
                              <Clock className="h-3 w-3" /> {durationLabel(item.durationMin)}
                              <span className="text-line">·</span>
                              {item.category}
                            </span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className="block text-sm text-espresso">{money(item.price)}</span>
                            <span className="block text-[10px] text-muted">
                              {money(
                                Math.round((item.price * (item.depositPct ?? depositPct)) / 100 / 100) * 100,
                              )}{" "}
                              deposit
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="label">What is it?</p>
                    <div className="flex flex-wrap gap-2">
                      {customCategories.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setCustomCategory(item)}
                          className={cn(
                            "rounded-full border px-3.5 py-1.5 text-[11px] tracking-wide transition",
                            customCategory === item
                              ? "border-ink bg-ink text-cream"
                              : "border-line text-ink/70 hover:border-ink/40",
                          )}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="brief" className="label">
                      Tell us exactly what you want
                    </label>
                    <textarea
                      id="brief"
                      value={brief}
                      onChange={(event) => setBrief(event.target.value)}
                      maxLength={800}
                      className="field min-h-[132px] resize-y"
                      placeholder="e.g. I want a custom wig made — 22 inches, bone straight, 5x5 closure, and I'd like it installed the same day. My cap size is medium. I also want my edges done."
                    />
                    <p className="mt-1 flex justify-between text-[10px] text-muted">
                      <span>A sentence or two is plenty. Photos can follow on WhatsApp.</span>
                      <span>{brief.length}/800</span>
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="budget" className="label">
                        Budget (₦) <span className="normal-case tracking-normal text-muted/60">optional</span>
                      </label>
                      <input
                        id="budget"
                        value={budget}
                        onChange={(event) => setBudget(event.target.value.replace(/[^\d]/g, ""))}
                        inputMode="numeric"
                        className="field"
                        placeholder="e.g. 150000"
                      />
                    </div>
                    <div className="rounded-xl bg-shell p-3 text-[11px] leading-relaxed text-muted">
                      <p className="font-medium text-espresso">No payment yet</p>
                      <p className="mt-1">
                        We&apos;ll read your brief and send a quote on WhatsApp. Nothing is charged
                        until you approve it.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  disabled={!canContinueFromService}
                  onClick={() => setStep(1)}
                  className="btn-primary w-full sm:w-auto"
                >
                  Choose a time <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 1 && active && (
            <div>
              <button
                type="button"
                onClick={() => setStep(0)}
                className="mb-4 inline-flex items-center gap-1 text-xs text-muted hover:text-ink"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> {isCustom ? "Edit your brief" : "Change service"}
              </button>
              <h2 className="font-display text-2xl text-ink sm:text-3xl">When suits you?</h2>
              <p className="mt-1.5 text-sm text-muted">
                {active.name} · {durationLabel(active.durationMin)} with {staffName}
              </p>

              <div className="no-scrollbar mt-5 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2">
                {days.map((day) => {
                  const selected = day.date === date;
                  const [, , dayNum] = day.date.split("-");
                  const weekday = formatDateShort(day.date).split(",")[0];
                  return (
                    <button
                      key={day.date}
                      type="button"
                      disabled={!day.open}
                      onClick={() => setDate(day.date)}
                      className={cn(
                        "flex w-[60px] shrink-0 snap-start flex-col items-center rounded-xl border py-2.5 transition sm:w-[62px]",
                        selected
                          ? "border-ink bg-ink text-cream"
                          : "border-line text-ink/80 hover:border-ink/40",
                        !day.open && "cursor-not-allowed opacity-35",
                      )}
                    >
                      <span className="text-[9px] uppercase tracking-[0.12em] opacity-70">{weekday}</span>
                      <span className="mt-0.5 font-display text-xl leading-none">{Number(dayNum)}</span>
                      <span className="mt-0.5 text-[9px] uppercase opacity-60">
                        {new Date(`${day.date}T00:00:00Z`).toLocaleString("en-GB", {
                          month: "short",
                          timeZone: "UTC",
                        })}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4">
                {slotsLoading ? (
                  <div className="flex items-center gap-2 py-10 text-sm text-muted">
                    <Loader2 className="h-4 w-4 animate-spin" /> Checking the calendar…
                  </div>
                ) : slotError ? (
                  <p className="py-6 text-sm text-rose-deep">{slotError}</p>
                ) : slots.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-line p-6 text-center">
                    <p className="font-display text-xl text-espresso">Fully booked that day.</p>
                    <p className="mt-1 text-sm text-muted">
                      Try another date, or message us — we sometimes hold a slot back.
                    </p>
                    <a
                      href={whatsappLink(
                        whatsapp,
                        `Hi Femme Beauty! I'm trying to book ${active.name} but the day I wanted is full.`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-outline btn-sm mt-4"
                    >
                      Message us
                    </a>
                  </div>
                ) : (
                  <>
                    <p className="label">Available start times · WAT</p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {slots.map((slot) => {
                        const selected = minutes === slot.minutes;
                        return (
                          <button
                            key={slot.minutes}
                            type="button"
                            onClick={() => setMinutes(slot.minutes)}
                            className={cn(
                              "rounded-lg border py-2.5 text-sm transition",
                              selected
                                ? "border-rose-deep bg-rose-deep text-white"
                                : "border-line text-ink/80 hover:border-rose",
                            )}
                          >
                            {slot.time}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button type="button" onClick={() => setStep(0)} className="text-xs text-muted hover:text-ink">
                  Back
                </button>
                <button
                  type="button"
                  disabled={!canContinueFromTime}
                  onClick={() => setStep(2)}
                  className="btn-primary flex-1 sm:flex-none"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mb-4 inline-flex items-center gap-1 text-xs text-muted hover:text-ink"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Change time
              </button>
              <h2 className="font-display text-2xl text-ink sm:text-3xl">Who are we expecting?</h2>
              <p className="mt-1.5 text-sm text-muted">
                We&apos;ll send your confirmation and quote details here.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="label">
                    Full name
                  </label>
                  <input
                    id="name"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className="field"
                    placeholder="e.g. Adaeze Okafor"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="label">
                    Phone (WhatsApp)
                  </label>
                  <input
                    id="phone"
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    className="field"
                    placeholder="0803 123 4567"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="label">
                    Email <span className="normal-case tracking-normal text-muted/60">(optional)</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    className="field"
                    placeholder="you@email.com"
                    autoComplete="email"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="note" className="label">
                    Anything else? <span className="normal-case tracking-normal text-muted/60">(optional)</span>
                  </label>
                  <textarea
                    id="note"
                    value={form.note}
                    onChange={(event) => setForm({ ...form, note: event.target.value })}
                    className="field min-h-[92px] resize-y"
                    placeholder="Cap size, lace preference, inspiration, allergies…"
                    maxLength={500}
                  />
                </div>
              </div>

              <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-muted">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(event) => setForm({ ...form, consent: event.target.checked })}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#9e6353]"
                />
                <span>
                  I agree to the booking and cancellation policy. I understand my slot is held for{" "}
                  {holdMinutes / 60} hours pending confirmation{isCustom ? " and a quote" : " and deposit"}.
                </span>
              </label>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button type="button" onClick={() => setStep(1)} className="text-xs text-muted hover:text-ink">
                  Back
                </button>
                <button
                  type="button"
                  disabled={!form.name.trim() || form.phone.replace(/\D/g, "").length < 10}
                  onClick={() => {
                    setError(null);
                    setStep(3);
                  }}
                  className="btn-primary flex-1 sm:flex-none"
                >
                  Review <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && active && minutes !== null && (
            <div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="mb-4 inline-flex items-center gap-1 text-xs text-muted hover:text-ink"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Edit details
              </button>
              <h2 className="font-display text-2xl text-ink sm:text-3xl">One last look.</h2>

              <dl className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line">
                {[
                  [isCustom ? "Request" : "Service", active.name],
                  ["When", `${formatDateShort(date)} at ${formatTime(minutes)}`],
                  ["Duration", durationLabel(active.durationMin)],
                  ...(isCustom ? [["Categories", customCategory]] : []),
                  ["With", staffName],
                  ["Name", form.name],
                  ["Phone", form.phone],
                  ...(form.email ? [["Email", form.email]] : []),
                  ...(budget ? [["Budget", money(Number(budget))]] : []),
                  ...(form.note ? [["Notes", form.note]] : []),
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                    <dt className="shrink-0 text-muted">{label}</dt>
                    <dd className="text-right text-ink">{value}</dd>
                  </div>
                ))}
              </dl>

              {isCustom && brief.trim() && (
                <div className="mt-4 rounded-xl border border-line bg-white p-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Your brief</p>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{brief}</p>
                </div>
              )}

              <div className="mt-4 rounded-xl bg-shell p-4">
                {isCustom ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Price</span>
                      <span className="font-medium text-rose-deep">Quote to follow</span>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-muted">
                      Nothing is charged now. We&apos;ll review your brief and send a quote on
                      WhatsApp; your slot is held for {holdMinutes / 60} hours.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Service total</span>
                      <span className="text-ink">{money(active.price)}</span>
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-muted">Deposit to confirm ({effectivePct}%)</span>
                      <span className="font-medium text-rose-deep">{money(deposit)}</span>
                    </div>
                    <p className="mt-3 text-[11px] leading-relaxed text-muted">
                      No payment online. After you submit, we&apos;ll message you the transfer details
                      on WhatsApp. Balance is paid in the studio.
                    </p>
                  </>
                )}
              </div>

              {error && (
                <p className="mt-4 rounded-lg border border-rose-deep/30 bg-rose-deep/5 px-3 py-2 text-xs text-rose-deep">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="btn-rose mt-5 w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Reserving your slot…
                  </>
                ) : (
                  <>
                    {isCustom ? "Send my request" : "Request appointment"}{" "}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
              <p className="mt-2.5 text-center text-[11px] text-muted">
                {isCustom
                  ? "We reply with a quote before anything is confirmed."
                  : "Your card is never charged. We confirm every booking personally."}
              </p>
            </div>
          )}
        </div>

        {/* Summary rail */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-line bg-white/60 p-4 sm:p-5">
            <p className="eyebrow">Your appointment</p>
            {active ? (
              <>
                <h3 className="mt-2 font-display text-xl text-ink">{active.name}</h3>
                <p className="mt-1 text-xs text-muted">
                  {durationLabel(active.durationMin)} · {isCustom ? "custom request" : active.category}
                </p>
                <div className="mt-4 space-y-2 border-t border-line pt-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted">When</span>
                    <span className="text-right text-ink">
                      {minutes !== null ? `${formatDateShort(date)}, ${formatTime(minutes)}` : "—"}
                    </span>
                  </div>
                  {isCustom ? (
                    <div className="flex justify-between">
                      <span className="text-muted">Price</span>
                      <span className="text-rose-deep">Quote to follow</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted">Price</span>
                        <span className="text-ink">{money(active.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Deposit</span>
                        <span className="text-rose-deep">{money(deposit)}</span>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted">
                Choose a service or describe your custom request to see the details here.
              </p>
            )}

            <div className="mt-5 space-y-2.5 border-t border-line pt-4 text-[11px] leading-relaxed text-muted">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose" /> {address}
              </p>
              <p className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose" /> Appointments only —
                come 5 minutes early.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
