import { NextResponse } from "next/server";
import { BookingError, createCustomRequest } from "@/lib/booking";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limit = rateLimit(`custom:${ip}`, 6, 10 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few minutes or message us on WhatsApp." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const date = String(body.date ?? "");
  const minutes = Number(body.minutes);
  const name = String(body.name ?? "");
  const phone = String(body.phone ?? "");
  const email = body.email ? String(body.email) : undefined;
  const category = String(body.category ?? "");
  const brief = String(body.brief ?? "");
  const budgetRaw = Number(body.budget);
  const budget = Number.isFinite(budgetRaw) ? budgetRaw : null;

  if (!date || !Number.isFinite(minutes) || minutes < 0) {
    return NextResponse.json({ error: "Choose a date and time." }, { status: 400 });
  }

  try {
    const appointment = await createCustomRequest({
      date,
      minutes,
      name,
      phone,
      email,
      category,
      brief,
      budget,
    });

    return NextResponse.json({ reference: appointment.reference });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Custom request failed", error);
    return NextResponse.json(
      { error: "Something went wrong on our side. Please try again or message us on WhatsApp." },
      { status: 500 },
    );
  }
}
