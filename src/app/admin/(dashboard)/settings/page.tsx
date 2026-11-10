import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatDateTime, todayStr } from "@/lib/time";
import { PageHeader } from "@/components/admin/ui";
import { BusinessSettingsForm, HoursForm, TimeOffForm } from "@/components/admin/SettingsForms";
import { removeTimeOffAction } from "@/app/admin/actions";
import { X } from "lucide-react";

export const dynamic = "force-dynamic";

const pad = (value: number) => String(value).padStart(2, "0");

function toTimeValue(minutes: number) {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

export default async function SettingsPage() {
  const [settings, staff] = await Promise.all([
    getSettings(),
    prisma.staff.findFirst({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  const [availability, timeOff] = await Promise.all([
    staff ? prisma.availability.findMany({ where: { staffId: staff.id } }) : Promise.resolve([]),
    staff
      ? prisma.timeOff.findMany({
          where: { staffId: staff.id, end: { gte: new Date() } },
          orderBy: { start: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const hoursRows = Array.from({ length: 7 }).map((_, weekday) => {
    const range = availability.find((item) => item.weekday === weekday);
    return {
      weekday,
      open: range ? toTimeValue(range.startMin) : "09:00",
      close: range ? toTimeValue(range.endMin) : "19:00",
      closed: !range,
    };
  });

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Settings"
        subtitle="Business details, deposit rules, opening hours and time off — this is what the website reads."
      />

      <div className="space-y-8">
        <BusinessSettingsForm values={settings} />

        <section id="hours" className="scroll-mt-6">
          <div className="mb-3">
            <h2 className="font-display text-2xl text-ink">Opening hours</h2>
            <p className="mt-1 text-xs text-muted">
              Slots are generated from these windows in 30-minute steps. Close a day to hide it from
              booking.
            </p>
          </div>
          <HoursForm rows={hoursRows} />
        </section>

        <section>
          <div className="mb-3">
            <h2 className="font-display text-2xl text-ink">Time off & blocked time</h2>
            <p className="mt-1 text-xs text-muted">
              Block a holiday, a supplier run, or an hour for a personal appointment. Bookings can&apos;t
              land inside these windows.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-white/70 p-4">
            <TimeOffForm today={todayStr()} />

            {timeOff.length > 0 && (
              <ul className="mt-4 divide-y divide-line border-t border-line">
                {timeOff.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div>
                      <p className="text-[12px] text-ink">
                        {formatDateTime(item.start)} → {formatDateTime(item.end)}
                      </p>
                      {item.reason && <p className="text-[10px] text-muted">{item.reason}</p>}
                    </div>
                    <form action={removeTimeOffAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-muted hover:border-rose-deep hover:text-rose-deep"
                        aria-label="Remove time off"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-line bg-white/60 p-4 text-[11px] leading-relaxed text-muted">
          <p className="font-medium text-espresso">Good to know</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Changing the deposit percentage affects new bookings only — existing ones keep their amount.</li>
            <li>The hold window is how long a new request keeps its slot before being released.</li>
            <li>Your bank details here are what customers see on their confirmation page.</li>
            <li>Staff accounts and passwords are managed on the server, not from this page.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
