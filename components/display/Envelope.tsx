import { cn } from "@/lib/utils";

/**
 * A decorative closed envelope with a wax-seal heart and a soft golden glow.
 * Used on the "selected / ready" screen while everyone waits for the reveal.
 */
export function Envelope({ className }: { className?: string }) {
  return (
    <div className={cn("relative animate-float-slow", className)}>
      {/* glow */}
      <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gold-500/20 blur-3xl animate-pulse-glow" />

      <svg
        viewBox="0 0 320 220"
        className="envelope-shadow h-auto w-[clamp(15rem,32vw,26rem)]"
        role="img"
        aria-label="A sealed envelope"
      >
        <defs>
          <linearGradient id="env-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fdf6e3" />
            <stop offset="100%" stopColor="#f3e4bd" />
          </linearGradient>
          <linearGradient id="env-flap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8edcf" />
            <stop offset="100%" stopColor="#e9d3a0" />
          </linearGradient>
          <linearGradient id="env-seal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff6b9d" />
            <stop offset="100%" stopColor="#d6336c" />
          </linearGradient>
        </defs>

        {/* body */}
        <rect x="14" y="40" width="292" height="168" rx="16" fill="url(#env-body)" />
        {/* inner pocket lines */}
        <path d="M14 56 L160 150 L306 56" fill="none" stroke="#d9c08a" strokeWidth="3" opacity="0.6" />
        {/* bottom fold */}
        <path d="M14 208 L160 120 L306 208 Z" fill="#efdcae" opacity="0.7" />
        {/* top flap */}
        <path
          d="M14 56 C14 46 22 40 32 40 L288 40 C298 40 306 46 306 56 L160 150 Z"
          fill="url(#env-flap)"
          stroke="#dcc795"
          strokeWidth="2"
        />

        {/* wax seal */}
        <circle cx="160" cy="118" r="26" fill="url(#env-seal)" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" />
        <text x="160" y="126" textAnchor="middle" fontSize="24" aria-hidden="true">
          💛
        </text>
      </svg>
    </div>
  );
}
