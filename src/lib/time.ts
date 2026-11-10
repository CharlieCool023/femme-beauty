/**
 * All business time is "Lagos wall clock". Lagos is UTC+1 all year (no DST),
 * so conversions are deterministic and safe to run on a UTC server.
 * Appointments are stored as UTC instants; every display goes through here.
 */

export const OFFSET_MIN = 60;
export const BUSINESS_TZ = "Africa/Lagos";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const pad = (n: number) => String(n).padStart(2, "0");

export function parseDateStr(dateStr: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) throw new Error(`Invalid date: ${dateStr}`);
  return { y: Number(match[1]), mo: Number(match[2]), d: Number(match[3]) };
}

export function isoDate(y: number, mo: number, d: number) {
  return `${y}-${pad(mo)}-${pad(d)}`;
}

/** Wall-clock minutes on a given Lagos date → the real UTC instant. */
export function toUtc(dateStr: string, minutes: number) {
  const { y, mo, d } = parseDateStr(dateStr);
  return new Date(Date.UTC(y, mo - 1, d, 0, minutes - OFFSET_MIN));
}

function shift(date: Date) {
  return new Date(date.getTime() + OFFSET_MIN * 60_000);
}

export function lagosMinutes(date: Date) {
  const s = shift(date);
  return s.getUTCHours() * 60 + s.getUTCMinutes();
}

export function lagosDateStr(date: Date) {
  const s = shift(date);
  return isoDate(s.getUTCFullYear(), s.getUTCMonth() + 1, s.getUTCDate());
}

export function lagosWeekday(date: Date) {
  return shift(date).getUTCDay();
}

export function weekdayOf(dateStr: string) {
  const { y, mo, d } = parseDateStr(dateStr);
  return new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
}

export function addDays(dateStr: string, days: number) {
  const { y, mo, d } = parseDateStr(dateStr);
  const t = new Date(Date.UTC(y, mo - 1, d));
  t.setUTCDate(t.getUTCDate() + days);
  return isoDate(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}

export function diffDays(from: string, to: string) {
  const a = parseDateStr(from);
  const b = parseDateStr(to);
  return Math.round(
    (Date.UTC(b.y, b.mo - 1, b.d) - Date.UTC(a.y, a.mo - 1, a.d)) / 86_400_000,
  );
}

export function todayStr() {
  return lagosDateStr(new Date());
}

/** Monday of the week containing dateStr. */
export function mondayOf(dateStr: string) {
  const wd = weekdayOf(dateStr);
  return addDays(dateStr, wd === 0 ? -6 : 1 - wd);
}

export function startOfDay(dateStr: string) {
  return toUtc(dateStr, 0);
}

export function endOfDay(dateStr: string) {
  return toUtc(addDays(dateStr, 1), 0);
}

export function formatTime(minutes: number) {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${pad(m)} ${suffix}`;
}

export function dayName(dateStr: string) {
  return DAYS[weekdayOf(dateStr)];
}

export function dayShort(dateStr: string) {
  return DAYS_SHORT[weekdayOf(dateStr)];
}

export function formatDateLong(dateStr: string) {
  const { y, mo, d } = parseDateStr(dateStr);
  return `${DAYS[weekdayOf(dateStr)]}, ${d} ${MONTHS[mo - 1]} ${y}`;
}

export function formatDateShort(dateStr: string) {
  const { y, mo, d } = parseDateStr(dateStr);
  return `${DAYS_SHORT[weekdayOf(dateStr)]}, ${d} ${MONTHS_SHORT[mo - 1]} ${y}`;
}

export function formatDayMonth(dateStr: string) {
  const { mo, d } = parseDateStr(dateStr);
  return `${d} ${MONTHS_SHORT[mo - 1]}`;
}

export function formatDateTime(date: Date) {
  return `${formatDateShort(lagosDateStr(date))} · ${formatTime(lagosMinutes(date))}`;
}

export function formatDateTimeLong(date: Date) {
  return `${formatDateLong(lagosDateStr(date))} at ${formatTime(lagosMinutes(date))}`;
}

export function relativeDay(dateStr: string) {
  const today = todayStr();
  const delta = diffDays(today, dateStr);
  if (delta === 0) return "Today";
  if (delta === 1) return "Tomorrow";
  if (delta === -1) return "Yesterday";
  return formatDateShort(dateStr);
}

export function durationLabel(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

/** For "9am – 7pm" opening-hours display. */
export function hoursLabel(startMin: number, endMin: number) {
  const fmt = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const suffix = h >= 12 ? "pm" : "am";
    const hh = h % 12 === 0 ? 12 : h % 12;
    return m ? `${hh}:${pad(m)}${suffix}` : `${hh}${suffix}`;
  };
  return `${fmt(startMin)} – ${fmt(endMin)}`;
}

export const WEEKDAY_NAMES = DAYS;
export const WEEKDAY_SHORT = DAYS_SHORT;
export const MONTH_NAMES = MONTHS;
