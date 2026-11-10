import { cache } from "react";
import { prisma } from "@/lib/db";

export const DEFAULT_SETTINGS: Record<string, string> = {
  businessName: "Femme Beauty",
  legalName: "Femme Beauty Hairs",
  tagline: "Hair, nails & lashes — made for you.",
  phone: "+234 806 389 6895",
  phoneAlt: "+234 901 129 8219",
  whatsapp: "+2348063896895",
  email: "femmebeautybysyl@gmail.com",
  instagram: "https://www.instagram.com/femmebeauty_ng",
  instagramHandle: "@femmebeauty_ng",
  tiktok: "https://www.tiktok.com/@beautybysylvia",
  tiktokHandle: "Beauty by Sylvia",
  address: "16 Shiro Street, Ajib, Fadeyi, Lagos",
  area: "Fadeyi, Lagos",
  mapsQuery: "16 Shiro Street, Fadeyi, Lagos, Nigeria",
  depositPct: "30",
  holdMinutes: "120",
  cancellationHours: "48",
  bankName: "GTBank",
  accountName: "Femme Beauty Hairs",
  accountNumber: "0000000000",
  deliveryNote: "Nationwide delivery across Nigeria. Lagos same-day dispatch on in-stock items.",
  bookingNote: "Appointments only — no walk-ins. A deposit confirms your slot.",
  aboutStory:
    "Femme Beauty is a Lagos hair and beauty studio built around one idea: you should leave feeling like the best version of yourself. From custom-made wigs to nails and lashes, everything is done by hand, with your measurements, your hair, your life in mind.",
};

export type Settings = Record<string, string>;

export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await prisma.setting.findMany();
  const stored = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return { ...DEFAULT_SETTINGS, ...stored };
});

export function settingNumber(settings: Settings, key: string, fallback: number) {
  const value = Number(settings[key]);
  return Number.isFinite(value) ? value : fallback;
}
