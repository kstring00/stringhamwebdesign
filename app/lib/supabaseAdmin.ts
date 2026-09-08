import { normalizeSupabaseUrl } from "./supabaseUrl";

type SupabaseRequestOptions = RequestInit & {
  returnRepresentation?: boolean;
};

function getConfig() {
  const supabaseUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL);
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !secretKey) {
    throw new Error("Supabase server environment variables are not configured.");
  }

  return { url: supabaseUrl.url, secretKey };
}

/**
 * Server-only PostgREST helper.
 *
 * The new sb_secret_* key is intentionally sent on the `apikey` header only.
 * It must never be exposed to browser code or committed to source control.
 */
export async function supabaseAdminRequest<T>(
  resource: string,
  options: SupabaseRequestOptions = {},
): Promise<T> {
  const { url, secretKey } = getConfig();
  const { returnRepresentation = false, headers, ...init } = options;

  const response = await fetch(`${url}/rest/v1/${resource}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: secretKey,
      "Content-Type": "application/json",
      ...(returnRepresentation ? { Prefer: "return=representation" } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Supabase request failed", response.status, detail.slice(0, 500));
    throw new Error(`Supabase request failed with status ${response.status}.`);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text) return undefined as T;

  return JSON.parse(text) as T;
}
