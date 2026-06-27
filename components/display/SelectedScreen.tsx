import type { Guest, ScreenStatus } from "@/lib/types";
import { Envelope } from "./Envelope";
import { Name } from "@/components/Name";

/**
 * Shown when a guest has been selected (and while "ready"). Big centered name
 * with the animated envelope underneath.
 */
export function SelectedScreen({
  guest,
  status,
}: {
  guest: Guest | null;
  status: ScreenStatus;
}) {
  const isReady = status === "ready";

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-[3vh] px-6 text-center">
      <div key={guest?.id} className="animate-pop-in">
        <div className="text-[3vh] text-white/60">🎊</div>
        <h1 className="font-display text-[clamp(2.5rem,9vh,9rem)] font-bold leading-tight text-gold-shimmer">
          <span aria-hidden className="me-3">
            🎊
          </span>
          <Name className="align-middle">{guest?.name ?? "…"}</Name>
          <span aria-hidden className="ms-3">
            🎊
          </span>
        </h1>
      </div>

      <Envelope />

      <p
        className={
          isReady
            ? "animate-pulse text-[5vh] font-extrabold text-gold-gradient"
            : "text-[4.5vh] font-bold text-white/85"
        }
      >
        {isReady ? "🥁 מתכוננים… 🥁" : "מוכנים?"}
      </p>
    </div>
  );
}
