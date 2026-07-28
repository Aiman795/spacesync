import { createClient } from "@supabase/supabase-js";

// Server-only client — used inside app/api/**/route.js handlers.
// Uses the service role key, so this file must never be imported into
// a "use client" component or shipped to the browser.
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
