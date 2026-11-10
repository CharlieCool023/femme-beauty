import { ProductArt } from "@/components/site/ProductArt";

/**
 * Renders a real uploaded photo when there is one, otherwise the branded
 * generated art. Shared by product cards, the hero and the lookbook.
 */
export function SmartImage({
  src,
  alt,
  category,
  seed,
  className,
  showLabel,
}: {
  src?: string | null;
  alt: string;
  category: string;
  seed?: string;
  className?: string;
  showLabel?: boolean;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`${className ?? ""} object-cover`}
      />
    );
  }

  return (
    <ProductArt category={category} seed={seed} className={className} showLabel={showLabel} />
  );
}
