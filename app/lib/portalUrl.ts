/**
 * One place that decides where a magic link sends people.
 *
 * This used to be a hardcoded production URL repeated in three route handlers,
 * which meant every sign-in link pointed at www.stringhamwebdesign.com even
 * when the link was requested from a dev server. Local sign-in was therefore
 * impossible to test.
 *
 * Resolution order:
 *   1. PORTAL_URL          — an explicit full URL to the portal entry point
 *   2. NEXT_PUBLIC_SITE_URL — the site origin; "/portal" is appended
 *   3. http://localhost:3000/portal
 *
 * Whatever this returns must ALSO be listed in Supabase under
 * Authentication → URL Configuration → Redirect URLs, or Supabase silently
 * refuses the redirect and the link bounces to the site root.
 */

const DEFAULT_PORTAL_URL = "http://localhost:3000/portal";

function withPortalPath(origin: string) {
  const base = origin.trim().replace(/\/+$/, "");
  if (!base) return "";
  return base.endsWith("/portal") ? base : `${base}/portal`;
}

export function portalUrl() {
  const explicit = withPortalPath(process.env.PORTAL_URL ?? "");
  if (explicit) return explicit;

  const site = withPortalPath(process.env.NEXT_PUBLIC_SITE_URL ?? "");
  if (site) return site;

  return DEFAULT_PORTAL_URL;
}

/**
 * True when the portal URL is still the localhost default while running a
 * production build — almost certainly a missing env var on the host, which
 * would send real clients a link to their own machine.
 */
export function portalUrlWarning() {
  if (process.env.NODE_ENV !== "production") return null;
  if (portalUrl() !== DEFAULT_PORTAL_URL) return null;

  return [
    "",
    "  PORTAL_URL IS NOT SET IN PRODUCTION",
    "",
    `    Magic links will point at ${DEFAULT_PORTAL_URL}, which is the`,
    "    recipient's own machine. Set PORTAL_URL (or NEXT_PUBLIC_SITE_URL)",
    "    in the Vercel project settings and redeploy.",
    "",
  ].join("\n");
}
