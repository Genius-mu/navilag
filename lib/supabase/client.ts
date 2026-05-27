/**
 * NaviLag — Supabase browser client
 *
 * Used in any client component or hook that needs to talk to Supabase
 * directly: signing in, signing up, fetching the current session, etc.
 *
 * This client reads/writes auth cookies via `document.cookie`, so it
 * stays in sync with the server client automatically.
 *
 * Usage:
 *   import { createClient } from "@/lib/supabase/client";
 *   const supabase = createClient();
 *   const { data } = await supabase.auth.signInWithPassword({ ... });
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
