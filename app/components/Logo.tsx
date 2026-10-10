/**
 * The Stringham Web Design logo, horizontal: the S mark beside the wordmark.
 * Cut from Kyle's logo file (brand/stringham-web-design-logo.png) with a
 * transparent background; the alt text is the name, so copied or read
 * aloud it says "Stringham Web Design". Size it with CSS height.
 */
export default function Logo({ className, eager = false }: { className?: string; eager?: boolean }) {
  return (
    <picture>
      <source type="image/webp" srcSet="/brand/logo-lockup.webp 2x, /brand/logo-lockup@3x.webp 3x" />
      <img
        className={className}
        src="/brand/logo-lockup.png"
        srcSet="/brand/logo-lockup.png 2x, /brand/logo-lockup@3x.png 3x"
        alt="Stringham Web Design"
        width={244}
        height={48}
        decoding="async"
        loading={eager ? "eager" : "lazy"}
      />
    </picture>
  );
}
