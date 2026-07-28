"use client";

import { createClient } from "@supabase/supabase-js";

// Browser-side client — safe to use in client components.
// Uses the public anon key; real row-level access control is enforced
// by Postgres RLS policies (see sql/schema.sql), not by this file.
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
