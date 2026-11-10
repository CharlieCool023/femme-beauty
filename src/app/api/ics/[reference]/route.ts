import { getAppointmentByReference } from "@/lib/booking";
import { appointmentTitle } from "@/lib/appointments";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

function stamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  const [appointment, settings] = await Promise.all([
    getAppointmentByReference(reference.toUpperCase()),
    getSettings(),
  ]);

  if (!appointment) {
    return new Response("Not found", { status: 404 });
  }

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Femme Beauty//Appointments//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${appointment.reference}@femmebeauty.ng`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(appointment.start)}`,
    `DTEND:${stamp(appointment.end)}`,
    `SUMMARY:${escapeText(`Femme Beauty — ${appointmentTitle(appointment)}`)}`,
    `DESCRIPTION:${escapeText(
      `Reference ${appointment.reference}\nWith ${appointment.staff.name}\nPrice ${appointment.price}\nQuestions? ${settings.phone}`,
    )}`,
    `LOCATION:${escapeText(settings.address)}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT24H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText("Appointment tomorrow at Femme Beauty")}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="femme-beauty-${appointment.reference}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
