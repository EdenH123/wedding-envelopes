"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { EVENT_STATE_ID, isSupabaseConfigured, supabase } from "./supabase";
import { computeStats, nameKey, normalizeName } from "./utils";
import type { EventState, EventStats, Guest, ScreenStatus } from "./types";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export interface ImportResult extends ActionResult {
  imported: number;
  skipped: number;
}

export interface UseEventShow {
  guests: Guest[];
  eventState: EventState | null;
  selectedGuest: Guest | null;
  stats: EventStats;
  loading: boolean;
  error: string | null;
  connected: boolean;
  configured: boolean;

  refetch: () => Promise<void>;

  // ── Selection / screen control ───────────────────────────────
  selectGuest: (guestId: string) => Promise<ActionResult>;
  setReady: () => Promise<ActionResult>;
  clearSelection: () => Promise<ActionResult>;

  // ── Reveal ───────────────────────────────────────────────────
  revealAmount: (guestId: string, amount: number) => Promise<ActionResult>;
  undoLastReveal: () => Promise<ActionResult>;

  // ── Guest CRUD ───────────────────────────────────────────────
  addAndReveal: (name: string, amount: number) => Promise<ActionResult>;
  importGuests: (names: string[]) => Promise<ImportResult>;
  deleteGuest: (guestId: string) => Promise<ActionResult>;
}

const nowISO = () => new Date().toISOString();

function sortGuests(list: Guest[]): Guest[] {
  return [...list].sort((a, b) => a.name.localeCompare(b.name, "he"));
}

export function useEventShow(): UseEventShow {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [eventState, setEventState] = useState<EventState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);

  // ── Initial fetch + ensure the singleton event_state row exists ──
  const fetchAll = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      setError(
        "Supabase לא מוגדר. הוסיפו את NEXT_PUBLIC_SUPABASE_URL ואת NEXT_PUBLIC_SUPABASE_ANON_KEY לקובץ .env.local."
      );
      return;
    }
    try {
      const [guestsRes, stateRes] = await Promise.all([
        supabase.from("guests").select("*"),
        supabase.from("event_state").select("*").eq("id", EVENT_STATE_ID).maybeSingle(),
      ]);

      if (guestsRes.error) throw guestsRes.error;
      setGuests(sortGuests(guestsRes.data ?? []));

      if (stateRes.error) throw stateRes.error;
      if (stateRes.data) {
        setEventState(stateRes.data);
      } else {
        // Defensive: seed the row if the SQL seed didn't run.
        const seed: EventState = {
          id: EVENT_STATE_ID,
          selected_guest_id: null,
          screen_status: "idle",
          last_reveal_at: null,
          updated_at: nowISO(),
        };
        const { data, error: upErr } = await supabase
          .from("event_state")
          .upsert(seed)
          .select()
          .single();
        if (upErr) throw upErr;
        setEventState(data);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "טעינת הנתונים נכשלה.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Realtime subscriptions (guests + event_state) ──
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    void fetchAll();

    const channel = supabase
      .channel("envelope-show")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guests" },
        (payload) => {
          setGuests((prev) => {
            if (payload.eventType === "DELETE") {
              const oldId = (payload.old as Partial<Guest>)?.id;
              return prev.filter((g) => g.id !== oldId);
            }
            const row = payload.new as Guest;
            const idx = prev.findIndex((g) => g.id === row.id);
            if (idx === -1) return sortGuests([...prev, row]);
            const next = [...prev];
            next[idx] = row;
            return sortGuests(next);
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_state" },
        (payload) => {
          if (payload.eventType === "DELETE") return;
          setEventState(payload.new as EventState);
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [fetchAll]);

  // ── Derived values ──
  const selectedGuest = useMemo<Guest | null>(() => {
    const id = eventState?.selected_guest_id;
    if (!id) return null;
    return guests.find((g) => g.id === id) ?? null;
  }, [guests, eventState?.selected_guest_id]);

  const stats = useMemo<EventStats>(() => computeStats(guests), [guests]);

  // ── Mutations ──
  const updateState = useCallback(
    async (patch: Partial<EventState>): Promise<ActionResult> => {
      try {
        const { error: err } = await supabase
          .from("event_state")
          .update({ ...patch, updated_at: nowISO() })
          .eq("id", EVENT_STATE_ID);
        if (err) throw err;
        return { ok: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "העדכון נכשל.";
        setError(message);
        return { ok: false, error: message };
      }
    },
    []
  );

  const setScreen = useCallback(
    (screen_status: ScreenStatus, extra: Partial<EventState> = {}) =>
      updateState({ screen_status, ...extra }),
    [updateState]
  );

  const selectGuest = useCallback(
    (guestId: string) =>
      setScreen("selected", { selected_guest_id: guestId }),
    [setScreen]
  );

  const setReady = useCallback(() => setScreen("ready"), [setScreen]);

  const clearSelection = useCallback(
    () => setScreen("idle", { selected_guest_id: null }),
    [setScreen]
  );

  const revealAmount = useCallback(
    async (guestId: string, amount: number): Promise<ActionResult> => {
      try {
        const { error: gErr } = await supabase
          .from("guests")
          .update({ amount, opened: true, updated_at: nowISO() })
          .eq("id", guestId);
        if (gErr) throw gErr;

        return await updateState({
          selected_guest_id: guestId,
          screen_status: "revealed",
          last_reveal_at: nowISO(),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "החשיפה נכשלה.";
        setError(message);
        return { ok: false, error: message };
      }
    },
    [updateState]
  );

  const undoLastReveal = useCallback(async (): Promise<ActionResult> => {
    // Prefer the currently selected guest; otherwise the most recently updated
    // opened guest.
    let target: Guest | null =
      selectedGuest && selectedGuest.opened ? selectedGuest : null;
    if (!target) {
      target = guests
        .filter((g) => g.opened)
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0] ?? null;
    }
    if (!target) {
      return { ok: false, error: "אין מה לבטל." };
    }
    try {
      const { error: gErr } = await supabase
        .from("guests")
        .update({ amount: null, opened: false, updated_at: nowISO() })
        .eq("id", target.id);
      if (gErr) throw gErr;

      // Keep the guest selected but move the screen back to "selected".
      return await updateState({
        selected_guest_id: target.id,
        screen_status: "selected",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "הביטול נכשל.";
      setError(message);
      return { ok: false, error: message };
    }
  }, [guests, selectedGuest, updateState]);

  const addAndReveal = useCallback(
    async (rawName: string, amount: number): Promise<ActionResult> => {
      const name = normalizeName(rawName);
      if (!name) return { ok: false, error: "נדרש שם." };
      try {
        const { data, error: iErr } = await supabase
          .from("guests")
          .insert({ name, amount, opened: true })
          .select()
          .single();
        if (iErr) throw iErr;

        return await updateState({
          selected_guest_id: data.id,
          screen_status: "revealed",
          last_reveal_at: nowISO(),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "ההוספה והחשיפה נכשלו.";
        setError(message);
        return { ok: false, error: message };
      }
    },
    [updateState]
  );

  const importGuests = useCallback(
    async (names: string[]): Promise<ImportResult> => {
      try {
        // Existing names (fresh query so we don't depend on possibly-stale state).
        const { data: existing, error: exErr } = await supabase
          .from("guests")
          .select("name");
        if (exErr) throw exErr;

        const seen = new Set<string>((existing ?? []).map((g) => nameKey(g.name)));
        const toInsert: { name: string }[] = [];
        for (const raw of names) {
          const name = normalizeName(raw);
          if (!name) continue;
          const key = nameKey(name);
          if (seen.has(key)) continue;
          seen.add(key);
          toInsert.push({ name });
        }

        const skipped = names.filter((n) => normalizeName(n)).length - toInsert.length;

        if (toInsert.length > 0) {
          // Chunk inserts to stay well within request limits.
          const CHUNK = 500;
          for (let i = 0; i < toInsert.length; i += CHUNK) {
            const { error: insErr } = await supabase
              .from("guests")
              .insert(toInsert.slice(i, i + CHUNK));
            if (insErr) throw insErr;
          }
        }

        await fetchAll();
        return { ok: true, imported: toInsert.length, skipped };
      } catch (err) {
        const message = err instanceof Error ? err.message : "הייבוא נכשל.";
        setError(message);
        return { ok: false, error: message, imported: 0, skipped: 0 };
      }
    },
    [fetchAll]
  );

  const deleteGuest = useCallback(
    async (guestId: string): Promise<ActionResult> => {
      try {
        // If the deleted guest is currently on screen, reset the display.
        if (eventState?.selected_guest_id === guestId) {
          await updateState({ selected_guest_id: null, screen_status: "idle" });
        }
        const { error: dErr } = await supabase
          .from("guests")
          .delete()
          .eq("id", guestId);
        if (dErr) throw dErr;
        return { ok: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "המחיקה נכשלה.";
        setError(message);
        return { ok: false, error: message };
      }
    },
    [eventState?.selected_guest_id, updateState]
  );

  return {
    guests,
    eventState,
    selectedGuest,
    stats,
    loading,
    error,
    connected,
    configured: isSupabaseConfigured,
    refetch: fetchAll,
    selectGuest,
    setReady,
    clearSelection,
    revealAmount,
    undoLastReveal,
    addAndReveal,
    importGuests,
    deleteGuest,
  };
}
