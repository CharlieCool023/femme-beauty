import type { Metadata, Viewport } from "next";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/700.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/jost/300.css";
import "@fontsource/jost/400.css";
import "@fontsource/jost/500.css";
import "@fontsource/jost/600.css";
import "@fontsource/parisienne/400.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Femme Beauty — Hair, nails & lashes in Lagos",
    template: "%s · Femme Beauty",
  },
  description:
    "Custom wigs, raw hair, hand-finished nails and lashes in Fadeyi, Lagos. Book your install, braids, manicure or lash set online — appointments only.",
  keywords: [
    "wigs Lagos",
    "wig install Fadeyi",
    "custom wig making Nigeria",
    "knotless braids Lagos",
    "gel manicure Lagos",
    "lash extensions Lagos",
    "Femme Beauty",
  ],
  openGraph: {
    title: "Femme Beauty — Hair, nails & lashes in Lagos",
    description:
      "Custom wigs, raw hair, hand-finished nails and lashes. Book online at Femme Beauty, Fadeyi.",
    type: "website",
    locale: "en_NG",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#fcf8f4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG">
      <body>{children}</body>
    </html>
  );
}
