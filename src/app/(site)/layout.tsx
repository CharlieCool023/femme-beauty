import { MessageCircle } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/utils";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <Header phone={settings.phone} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />

      <a
        href={whatsappLink(
          settings.whatsapp,
          "Hi Femme Beauty! I'd like to ask about an appointment.",
        )}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/15 transition hover:scale-105"
        aria-label="Chat with Femme Beauty on WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}
