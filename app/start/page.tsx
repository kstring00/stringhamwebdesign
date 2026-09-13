import { redirect } from "next/navigation";

/**
 * /start is an alias for the brief. It forwards its query string, so a link
 * written as /start?package=standard lands on the same pre-selected form as
 * /quote?package=standard.
 */
export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") query.set(key, value);
    else if (Array.isArray(value) && typeof value[0] === "string") query.set(key, value[0]);
  }

  const search = query.toString();
  redirect(search ? `/quote?${search}` : "/quote");
}
