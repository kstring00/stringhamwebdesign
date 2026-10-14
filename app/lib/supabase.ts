/**
 * Server-only PostgREST helper for the referral tables. SUPABASE_URL is the
 * bare project URL (a trailing /rest/v1 is tolerated and stripped);
 * SUPABASE_SECRET_KEY (sb_secret_…) goes on the `apikey` header only, and
 * never reaches the browser.
 */
export function supabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

export class SupabaseError extends Error {
  constructor(public status: number, public detail: string) {
    super(`Supabase request failed with status ${status}.`);
  }
}

export async function supabase<T>(resource: string, init: RequestInit & { returnRows?: boolean } = {}): Promise<T> {
  const base = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
  const key = process.env.SUPABASE_SECRET_KEY || "";
  if (!base || !key) throw new SupabaseError(503, "SUPABASE_URL or SUPABASE_SECRET_KEY is not set.");
  const { returnRows, headers, ...rest } = init;
  const res = await fetch(`${base}/rest/v1/${resource}`, {
    ...rest,
    cache: "no-store",
    headers: { apikey: key, "Content-Type": "application/json", ...(returnRows ? { Prefer: "return=representation" } : {}), ...headers },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Supabase request failed", res.status, detail.slice(0, 500));
    throw new SupabaseError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
