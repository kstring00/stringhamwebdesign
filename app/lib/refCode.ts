/**
 * Referral codes, shared by the browser and the server: 3 to 32 characters,
 * lower-case letters, digits and hyphens, starting and ending with a letter
 * or digit ("dad", "maria-cpa"). A code is the only thing that ever goes in
 * a URL; never a name, email or phone.
 */
export const REF_PATTERN = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/;

/** Codes nobody can take: they'd read as the site's own pages or people. */
const RESERVED = new Set(["admin", "manage", "kyle", "stringham", "swd", "test", "null", "undefined", "partners", "checkup", "quote", "blog", "api", "www", "support", "help"]);

/** "Maria, CPA!" → "maria-cpa". Empty when nothing usable is left. */
export function toCode(input: string) {
  return input.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32).replace(/-+$/, "");
}

export const isValidCode = (code: string) => REF_PATTERN.test(code) && !RESERVED.has(code);

/** How long a shared link keeps its credit in a visitor's browser. */
export const REF_DAYS = 90;
export const REF_COOKIE = "swd_ref";
