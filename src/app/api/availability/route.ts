import { NextResponse } from "next/server";
import { getAvailability } from "@/lib/booking";
import { addDays, todayStr } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date") ?? todayStr();
  const staffId = searchParams.get("staffId");

  if (!serviceId) {
    return NextResponse.json({ error: "serviceId is required" }, { status: 400 });
  }

  if (date < todayStr() || date > addDays(todayStr(), 60)) {
    return NextResponse.json({ slots: [], closed: true, error: "Date outside booking window" });
  }

  try {
    const result = await getAvailability(serviceId, date, staffId);
    if (!result) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    return NextResponse.json({
      slots: result.slots,
      closed: result.closed,
      staff: { id: result.staff.id, name: result.staff.name },
      service: {
        id: result.service.id,
        name: result.service.name,
        durationMin: result.service.durationMin,
        price: result.service.price,
        bufferAfterMin: result.service.bufferAfterMin,
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not load availability" }, { status: 400 });
  }
}
