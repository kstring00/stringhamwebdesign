/**
 * The Stringham Web Design logo, horizontal: the S mark beside the wordmark.
 * This is the light version, for the dark site: Kyle's logo with the word
 * "Stringham" turned from navy to cream so it can be read on the page; the
 * blue mark and "WEB DESIGN" are untouched (scripts/logo-light.js makes it
 * from brand/logo-lockup.png, which stays as the original). The alt text is
 * the name, so copied or read aloud it says "Stringham Web Design". Size it
 * with CSS height.
 */
export default function Logo({ className, eager = false }: { className?: string; eager?: boolean }) {
  return (
    <picture>
      <source type="image/webp" srcSet="/brand/logo-lockup-light.webp 2x, /brand/logo-lockup-light@3x.webp 3x" />
      <img
        className={className}
        src="/brand/logo-lockup-light.png"
        srcSet="/brand/logo-lockup-light.png 2x, /brand/logo-lockup-light@3x.png 3x"
        alt="Stringham Web Design"
        width={244}
        height={48}
        decoding="async"
        loading={eager ? "eager" : "lazy"}
      />
    </picture>
  );
}
