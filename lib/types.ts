/**
 * Shared domain types for Envelope Show.
 * These mirror the Supabase tables defined in supabase-schema.sql.
 */

export type ScreenStatus = "idle" | "selected" | "ready" | "revealed";

/** How the gift was given. Stored as a stable key; rendered in Hebrew in the UI. */
export type PaymentMethod = "bit" | "cash" | "check";

// NOTE: These are `type` aliases (not `interface`s) on purpose. The Supabase
// typed client requires each table's Row/Insert/Update to satisfy
// `Record<string, unknown>`, and TS interfaces don't satisfy that index
// signature — only object-literal type aliases do.
export type Guest = {
  id: string;
  name: string;
  amount: number | null;
  payment_method: PaymentMethod | null;
  opened: boolean;
  created_at: string;
  updated_at: string;
};

export type EventState = {
  id: string; // always "main"
  selected_guest_id: string | null;
  screen_status: ScreenStatus;
  last_reveal_at: string | null;
  updated_at: string;
};

/** Derived, read-only statistics shown live on the display. */
export interface EventStats {
  totalGuests: number;
  openedCount: number;
  totalAmount: number;
  averageAmount: number;
  king: Guest | null;
}

/** Shape of the Supabase schema for typed client calls (matches GenericSchema). */
export interface Database {
  public: {
    Tables: {
      guests: {
        Row: Guest;
        Insert: {
          id?: string;
          name: string;
          amount?: number | null;
          payment_method?: PaymentMethod | null;
          opened?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Guest>;
        Relationships: [];
      };
      event_state: {
        Row: EventState;
        Insert: {
          id: string;
          selected_guest_id?: string | null;
          screen_status?: ScreenStatus;
          last_reveal_at?: string | null;
          updated_at?: string;
        };
        Update: Partial<EventState>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
