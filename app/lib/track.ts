/**
 * Custom events for Microsoft Clarity. A no-op unless Clarity is running
 * (production with NEXT_PUBLIC_CLARITY_ID set), so nothing here can throw
 * or slow a page. Tags ride along as Clarity custom tags for filtering.
 */
export function track(event: string, tags: Record<string, string> = {}) {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "production" || !process.env.NEXT_PUBLIC_CLARITY_ID) return;
  // Clarity's own command queue, so an event sent before the tag has loaded
  // (it waits for the load event) is kept and replayed, not lost.
  // Same shape as Clarity's own snippet, which keeps this function when it loads.
  type Queue = ((...args: unknown[]) => void) & { q?: IArguments[] };
  const w = window as unknown as { clarity?: Queue };
  if (!w.clarity) {
    const queue: Queue = function () {
      (queue.q = queue.q || []).push(arguments); // arguments, as Clarity reads its queue
    };
    w.clarity = queue;
  }
  import("@microsoft/clarity")
    .then(({ default: Clarity }) => {
      for (const [k, v] of Object.entries(tags)) Clarity.setTag(k, v);
      Clarity.event(event);
    })
    .catch(() => {});
}
