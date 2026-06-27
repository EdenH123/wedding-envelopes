import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Returns true when both public env vars are present. The UI uses this to show
 * a friendly setup message instead of crashing when the project isn't wired up.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Single shared browser client (singleton). Realtime is tuned to be snappy for
 * a live ceremony.
 *
 * If env vars are missing we still construct a client with placeholder values so
 * imports never throw at module load — callers should gate on `isSupabaseConfigured`.
 */
export const supabase = createClient<Database>(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "public-anon-key-placeholder",
  {
    realtime: {
      params: { eventsPerSecond: 20 },
    },
    auth: {
      persistSession: false,
    },
  }
);

/** The single event_state row id used throughout the app. */
export const EVENT_STATE_ID = "main";
