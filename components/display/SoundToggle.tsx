"use client";

import { useEffect, useState } from "react";
import { getMutedPref, playTestChime, setMuted, unlockAudio } from "@/lib/sound";

/**
 * Sits in the corner of the display. Browsers block audio until a user gesture,
 * so the operator taps "enable sound" once when setting up the TV; after that
 * it's a simple mute toggle.
 */
export function SoundToggle() {
  const [enabled, setEnabled] = useState(false);
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    setMutedState(getMutedPref());
  }, []);

  async function enable() {
    await unlockAudio();
    setMuted(false);
    setMutedState(false);
    setEnabled(true);
    playTestChime();
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  }

  if (!enabled) {
    return (
      <button
        type="button"
        onClick={enable}
        className="absolute start-4 top-4 z-30 rounded-full border border-gold-500/40 bg-black/40 px-3 py-1.5 text-xs font-medium text-gold-200 backdrop-blur transition hover:bg-black/60"
      >
        🔊 הפעלת סאונד
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleMute}
      aria-label={muted ? "הפעלת סאונד" : "השתקה"}
      className="absolute start-4 top-4 z-30 rounded-full border border-white/15 bg-black/40 px-2.5 py-1.5 text-sm backdrop-blur transition hover:bg-black/60"
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
