import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const media = await prisma.media.findUnique({
    where: { id },
    select: { mime: true, data: true },
  });

  if (!media) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(media.data), {
    headers: {
      "Content-Type": media.mime,
      "Content-Length": String(media.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
