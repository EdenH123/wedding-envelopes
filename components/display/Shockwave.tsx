import type { AmountTier } from "@/lib/utils";

// Ring + flash colours per tier (the bigger the amount, the more intense).
function colors(tier: AmountTier): { ring: string; flash: string } {
  switch (tier) {
    case "royal":
      return { ring: "rgba(212,175,55,0.9)", flash: "rgba(212,175,55,0.5)" };
    case "lucky17":
      return { ring: "rgba(220,38,38,0.85)", flash: "rgba(220,38,38,0.45)" };
    case "fireworks":
      return { ring: "rgba(236,72,153,0.8)", flash: "rgba(236,72,153,0.4)" };
    case "confetti-big":
      return { ring: "rgba(124,58,237,0.8)", flash: "rgba(124,58,237,0.35)" };
    case "confetti-small":
      return { ring: "rgba(76,201,240,0.7)", flash: "rgba(76,201,240,0.3)" };
    case "sparkle":
    default:
      return { ring: "rgba(212,175,55,0.6)", flash: "rgba(212,175,55,0.22)" };
  }
}

/** A ring ripple + screen flash that bursts from the centre on a reveal. */
export function Shockwave({ tier }: { tier: AmountTier }) {
  const { ring, flash } = colors(tier);
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0 animate-flash-out"
        style={{ background: `radial-gradient(circle at 50% 45%, ${flash}, transparent 60%)` }}
      />
      <div
        className="absolute left-1/2 top-[45%] h-[45vh] w-[45vh] animate-ring-expand rounded-full"
        style={{ border: `0.6vh solid ${ring}` }}
      />
      <div
        className="absolute left-1/2 top-[45%] h-[70vh] w-[70vh] animate-ring-expand rounded-full [animation-delay:140ms]"
        style={{ border: `0.4vh solid ${ring}` }}
      />
    </div>
  );
}
