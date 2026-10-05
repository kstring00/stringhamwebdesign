/**
 * Custom events for Microsoft Clarity. A no-op unless Clarity is running
 * (production with NEXT_PUBLIC_CLARITY_ID set), so nothing here can throw
 * or slow a page. Tags ride along as Clarity custom tags for filtering.
 */
export function track(event: string, tags: Record<string, string> = {}) {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "production" || !process.env.NEXT_PUBLIC_CLARITY_ID) return;
  import("@microsoft/clarity")
    .then(({ default: Clarity }) => {
      for (const [k, v] of Object.entries(tags)) Clarity.setTag(k, v);
      Clarity.event(event);
    })
    .catch(() => {});
}
