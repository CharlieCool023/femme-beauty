import { NextResponse } from "next/server";
import { BookingError, createBooking } from "@/lib/booking";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limit = rateLimit(`book:${ip}`, 6, 10 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many booking attempts. Please wait a few minutes or message us on WhatsApp." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const serviceId = String(body.serviceId ?? "");
  const date = String(body.date ?? "");
  const minutes = Number(body.minutes);
  const name = String(body.name ?? "");
  const phone = String(body.phone ?? "");
  const email = body.email ? String(body.email) : undefined;
  const note = body.note ? String(body.note) : undefined;
  const staffId = body.staffId ? String(body.staffId) : undefined;

  if (!serviceId || !date || !Number.isFinite(minutes)) {
    return NextResponse.json({ error: "Missing booking details" }, { status: 400 });
  }

  try {
    const appointment = await createBooking({
      serviceId,
      date,
      minutes,
      name,
      phone,
      email,
      note,
      staffId,
    });

    return NextResponse.json({
      reference: appointment.reference,
      start: appointment.start.toISOString(),
    });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Booking failed", error);
    return NextResponse.json(
      { error: "Something went wrong on our side. Please try again or message us on WhatsApp." },
      { status: 500 },
    );
  }
}
