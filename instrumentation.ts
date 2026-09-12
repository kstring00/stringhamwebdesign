import { portalUrlWarning } from "./app/lib/portalUrl";
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

  // A portal URL left at the localhost default in production sends clients a
  // sign-in link pointing at their own machine.
  const portalWarning = portalUrlWarning();
  if (portalWarning) console.warn(portalWarning);

  const supabaseUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL);

  if (!supabaseUrl) {
    console.warn(
      "\n  SUPABASE_URL is not set. The portal and the Stripe webhook will\n" +
        "  both fail until it is. See .env.example.\n",
    );
    return;
  }

  const warning = supabaseUrlWarning(supabaseUrl);
  if (warning) console.warn(warning);
}
