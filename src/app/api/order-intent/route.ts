import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limit = rateLimit(`order:${ip}`, 12, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data = body as {
    productId?: string;
    productName?: string;
    variant?: string | null;
    amount?: number | null;
  };

  if (!data.productId && !data.productName) {
    return NextResponse.json({ error: "Missing product" }, { status: 400 });
  }

  const product = data.productId
    ? await prisma.product.findUnique({ where: { id: data.productId } })
    : null;

  await prisma.orderIntent.create({
    data: {
      productId: product?.id ?? null,
      productName: product?.name ?? data.productName ?? "Unknown product",
      variant: data.variant ?? null,
      amount: product?.price ?? data.amount ?? null,
      status: "NEW",
    },
  });

  return NextResponse.json({ ok: true });
}
