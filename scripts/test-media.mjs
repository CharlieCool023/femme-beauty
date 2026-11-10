import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const [action, ...args] = process.argv.slice(2);

if (action === "attach") {
  const mediaId = args[0];
  const product = await prisma.product.findUnique({ where: { slug: "bone-straight-frontal-wig" } });
  if (!product) throw new Error("Product missing");

  await prisma.productImage.create({
    data: { productId: product.id, mediaId, sortOrder: 0, alt: "Test cover" },
  });
  await prisma.product.update({
    where: { id: product.id },
    data: { image: `/api/media/${mediaId}` },
  });

  await prisma.siteImage.upsert({
    where: { key: "hero" },
    update: { mediaId, alt: "Test hero" },
    create: { key: "hero", mediaId, alt: "Test hero" },
  });
  console.log("attached", mediaId);
}

if (action === "cleanup") {
  const mediaId = args[0];
  await prisma.productImage.deleteMany({ where: { mediaId } });
  await prisma.product.updateMany({ data: { image: null }, where: { image: `/api/media/${mediaId}` } });
  await prisma.siteImage.deleteMany({ where: { mediaId } });
  await prisma.media.delete({ where: { id: mediaId } }).catch(() => null);
  console.log("cleaned", mediaId);
}

await prisma.$disconnect();
