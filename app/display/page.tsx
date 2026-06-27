"use client";

import { useEffect, useRef } from "react";
import { useEventShow } from "@/lib/useEventShow";
import { getAmountTier } from "@/lib/utils";
import { runCelebration } from "@/lib/celebrate";
import { SetupNotice } from "@/components/SetupNotice";
import { StatsBar } from "@/components/display/StatsBar";
import { IdleScreen } from "@/components/display/IdleScreen";
import { SelectedScreen } from "@/components/display/SelectedScreen";
import { RevealScreen } from "@/components/display/RevealScreen";

export default function DisplayPage() {
  const { eventState, selectedGuest, stats, loading, error, connected, configured } =
    useEventShow();

  // Fire the right celebration whenever a NEW reveal happens. We key off
  // last_reveal_at so re-renders don't re-trigger, but each fresh reveal does.
  const lastFiredRef = useRef<string | null>(null);
  const cleanupRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (eventState?.screen_status !== "revealed") return;
    const stamp = eventState.last_reveal_at;
    if (!stamp || stamp === lastFiredRef.current) return;
    if (!selectedGuest || typeof selectedGuest.amount !== "number") return;

    lastFiredRef.current = stamp;
    cleanupRef.current(); // stop any previous loop
    cleanupRef.current = runCelebration(getAmountTier(selectedGuest.amount));
  }, [eventState?.screen_status, eventState?.last_reveal_at, selectedGuest]);

  // Stop animations on unmount.
  useEffect(() => () => cleanupRef.current(), []);

  if (!configured) return <SetupNotice />;

  const status = eventState?.screen_status ?? "idle";

  return (
    <main className="bg-stage-animated vignette relative h-screen w-screen overflow-hidden">
      {/* connection / loading indicator (tiny, top-corner) */}
      <div className="absolute end-4 top-4 z-30 flex items-center gap-2 text-xs text-white/40">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            connected ? "bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.6)]" : "bg-amber-400"
          }`}
        />
        {connected ? "מחובר" : loading ? "מתחבר…" : "מתחבר מחדש…"}
      </div>

      {error && (
        <div className="absolute inset-x-0 top-0 z-30 bg-red-500/20 px-4 py-2 text-center text-sm text-red-100">
          {error}
        </div>
      )}

      {/* main stage */}
      <div className="absolute inset-0 z-10 pb-[16vh]">
        {status === "revealed" ? (
          <RevealScreen guest={selectedGuest} />
        ) : status === "selected" || status === "ready" ? (
          <SelectedScreen guest={selectedGuest} status={status} />
        ) : (
          <IdleScreen stats={stats} />
        )}
      </div>

      {/* persistent live stats */}
      <StatsBar stats={stats} />
    </main>
  );
}
