import type { Guest, ScreenStatus } from "@/lib/types";
import { Envelope } from "./Envelope";
import { Name } from "@/components/Name";

/**
 * Shown when a guest has been selected (and while "ready"). Big centered name
 * with the animated envelope underneath. "Ready" adds a tension build:
 * pulsing spotlight + a shaking envelope.
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
      {/* tension spotlight while "ready" */}
      {isReady && (
        <div
          className="pointer-events-none absolute inset-0 -z-10 animate-spotlight-pulse"
          style={{
            background:
              "radial-gradient(40vh 40vh at 50% 55%, rgba(212,175,55,0.35), transparent 70%)",
          }}
        />
      )}

      {/* guest name with a continuous gold sheen (the "flourish") */}
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

      {/* envelope — shakes with anticipation while "ready" */}
      <div className={isReady ? "animate-shake" : ""}>
        <Envelope />
      </div>

      <p
        className={
          isReady
            ? "animate-pulse text-[5.5vh] font-extrabold text-gold-shimmer"
            : "text-[4.5vh] font-bold text-white/85"
        }
      >
        {isReady ? "🥁 מתכוננים… 🥁" : "מוכנים?"}
      </p>
    </div>
  );
}
