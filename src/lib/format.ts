export function money(amount: number) {
  return `₦${Math.round(amount).toLocaleString("en-US")}`;
}

/** Compact display for big KPIs: ₦1.2m / ₦480k */
export function moneyCompact(amount: number) {
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  if (amount >= 100_000) return `₦${Math.round(amount / 1000)}k`;
  return money(amount);
}

export function plural(count: number, singular: string, pluralForm?: string) {
  return `${count} ${count === 1 ? singular : pluralForm ?? `${singular}s`}`;
}
