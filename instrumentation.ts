import { normalizeSupabaseUrl, supabaseUrlWarning } from "./app/lib/supabaseUrl";

/**
 * Runs once per server instance, before the first request is handled.
 *
 * Env problems that only surface deep inside a request are expensive: a wrong
 * SUPABASE_URL made every database write fail while the Stripe webhook kept
 * answering 200. Checking it here means the operator sees it in the boot log
 * instead of inferring it from downstream symptoms.
 */
export function register() {
  // register() is invoked for each runtime; only the Node server reads these.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const supabaseUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL);

  if (!supabaseUrl) {
    console.warn(
      "\n  SUPABASE_URL is not set. The portal, the AI intake and the Stripe\n" +
        "  webhook will all fail until it is. See .env.example.\n",
    );
    return;
  }

  const warning = supabaseUrlWarning(supabaseUrl);
  if (warning) console.warn(warning);
}
