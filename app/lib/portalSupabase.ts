import { cookies } from "next/headers";

const ACCESS_COOKIE = "swd_portal_access";
const REFRESH_COOKIE = "swd_portal_refresh";
const DEFAULT_ADMIN_EMAIL = "stringham00@gmail.com";

type RequestOptions = RequestInit & {
  returnRepresentation?: boolean;
};

export type PortalProfile = {
  id: string;
  email: string;
  role: "admin" | "client";
  name: string;
  created_at: string;
};

export type PortalAuthUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

export type PortalSession = {
  accessToken: string;
  user: PortalAuthUser;
  profile: PortalProfile;
};

function config() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error("Supabase server environment variables are not configured.");
  }

  return { url, secretKey };
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function adminRest<T>(
  resource: string,
  options: RequestOptions = {},
): Promise<T> {
  const { url, secretKey } = config();
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
    console.error("Portal admin REST failed", response.status, detail.slice(0, 500));
    throw new Error(`Portal data request failed with status ${response.status}.`);
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function userRest<T>(
  resource: string,
  accessToken: string,
  options: RequestOptions = {},
): Promise<T> {
  const { url, secretKey } = config();
  const { returnRepresentation = false, headers, ...init } = options;
  const response = await fetch(`${url}/rest/v1/${resource}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(returnRepresentation ? { Prefer: "return=representation" } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Portal user REST failed", response.status, detail.slice(0, 500));
    throw new Error(`Portal data request failed with status ${response.status}.`);
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { url, secretKey } = config();
  const response = await fetch(`${url}/auth/v1${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      apikey: secretKey,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Portal auth admin request failed", response.status, detail.slice(0, 500));
    throw new Error(detail || `Auth request failed with status ${response.status}.`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function fetchAuthUser(accessToken: string) {
  const { url, secretKey } = config();
  const response = await fetch(`${url}/auth/v1/user`, {
    cache: "no-store",
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) return null;
  return (await response.json()) as PortalAuthUser;
}

async function refreshSession(refreshToken: string) {
  const { url, secretKey } = config();
  const response = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    cache: "no-store",
    headers: {
      apikey: secretKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) return null;
  return (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in?: number;
    user: PortalAuthUser;
  };
}

export async function setPortalCookies(
  accessToken: string,
  refreshToken: string,
  accessMaxAge = 3600,
) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, accessToken, cookieOptions(accessMaxAge));
  store.set(REFRESH_COOKIE, refreshToken, cookieOptions(60 * 60 * 24 * 30));
}

export async function clearPortalCookies() {
  const store = await cookies();
  store.set(ACCESS_COOKIE, "", cookieOptions(0));
  store.set(REFRESH_COOKIE, "", cookieOptions(0));
}

export async function getPortalSession(): Promise<PortalSession | null> {
  const store = await cookies();
  let accessToken = store.get(ACCESS_COOKIE)?.value ?? "";
  const refreshToken = store.get(REFRESH_COOKIE)?.value ?? "";

  let user = accessToken ? await fetchAuthUser(accessToken) : null;

  if (!user && refreshToken) {
    const refreshed = await refreshSession(refreshToken);
    if (refreshed) {
      accessToken = refreshed.access_token;
      user = refreshed.user;
      await setPortalCookies(
        refreshed.access_token,
        refreshed.refresh_token,
        refreshed.expires_in ?? 3600,
      );
    }
  }

  if (!user || !accessToken) return null;

  const profiles = await userRest<PortalProfile[]>(
    `users?id=eq.${encodeURIComponent(user.id)}&select=id,email,role,name,created_at&limit=1`,
    accessToken,
  ).catch(() => []);

  const profile = profiles[0];
  if (!profile) return null;

  return { accessToken, user, profile };
}

export async function validatePortalTokens(accessToken: string) {
  const user = await fetchAuthUser(accessToken);
  if (!user) return null;

  const profiles = await adminRest<PortalProfile[]>(
    `users?id=eq.${encodeURIComponent(user.id)}&select=id,email,role,name,created_at&limit=1`,
  );

  return profiles[0] ? { user, profile: profiles[0] } : null;
}

async function listAuthUsers() {
  const response = await authFetch<{
    users?: PortalAuthUser[];
  }>("/admin/users?page=1&per_page=1000");
  return response.users ?? [];
}

async function createAuthUser(email: string, name: string) {
  return authFetch<PortalAuthUser>("/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email,
      email_confirm: true,
      user_metadata: { name },
    }),
  });
}

export async function ensurePortalUser(
  email: string,
  name: string,
  role: "admin" | "client",
) {
  const normalized = email.trim().toLowerCase();
  const existingProfiles = await adminRest<PortalProfile[]>(
    `users?email=eq.${encodeURIComponent(normalized)}&select=id,email,role,name,created_at&limit=1`,
  );

  if (existingProfiles[0]) return existingProfiles[0];

  const authUsers = await listAuthUsers();
  let authUser = authUsers.find(
    (item) => item.email?.toLowerCase() === normalized,
  );

  if (!authUser) {
    authUser = await createAuthUser(normalized, name);
  }

  const inserted = await adminRest<PortalProfile[]>("users", {
    method: "POST",
    returnRepresentation: true,
    body: JSON.stringify({
      id: authUser.id,
      email: normalized,
      role,
      name,
    }),
  });

  return inserted[0];
}

export async function bootstrapAdminIfNeeded(email: string) {
  const adminEmail = (
    process.env.PORTAL_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL
  ).toLowerCase();

  if (email.trim().toLowerCase() !== adminEmail) return null;
  return ensurePortalUser(adminEmail, "Kyle Stringham", "admin");
}

export async function sendPortalMagicLink(email: string, redirectTo: string) {
  const { url, secretKey } = config();
  const endpoint = `${url}/auth/v1/otp?redirect_to=${encodeURIComponent(redirectTo)}`;
  const response = await fetch(endpoint, {
    method: "POST",
    cache: "no-store",
    headers: {
      apikey: secretKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      create_user: false,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Portal magic link failed", response.status, detail.slice(0, 500));
    throw new Error("Could not send the sign-in link.");
  }
}

export async function storageUserRequest(
  path: string,
  accessToken: string,
  options: RequestInit = {},
) {
  const { url, secretKey } = config();
  return fetch(`${url}/storage/v1${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });
}
