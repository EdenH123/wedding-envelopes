import type { Guest } from "@/lib/types";
import { cn, formatILS, getAmountTier, tierLabel, type AmountTier } from "@/lib/utils";
import { Name } from "@/components/Name";

// Ambient twinkle positions (deterministic).
const TWINKLES = ["6%", "16%", "30%", "44%", "58%", "72%", "84%", "92%"];

export function RevealScreen({ guest }: { guest: Guest | null }) {
  const amount = guest?.amount ?? 0;
  const tier = getAmountTier(amount);
  const isKingTier = tier === "royal";
  const isLucky = tier === "lucky17";

  return (
    <div
      // `key` forces the entrance animation to replay on every new reveal.
      key={`${guest?.id}-${guest?.updated_at}`}
      className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center"
    >
      {/* tier-colored aura behind everything */}
      <div className={cn("absolute inset-0 -z-10", auraClass(tier))} />

      {/* ambient twinkles */}
      {TWINKLES.map((left, i) => (
        <span
          key={i}
          className="pointer-events-none absolute top-[12%] animate-twinkle text-[2.4vh]"
          style={{ left, animationDelay: `${(i % 4) * 0.35}s` }}
          aria-hidden
        >
          ✨
        </span>
      ))}

      {/* crown for the royal / king tier */}
      {isKingTier && (
        <div className="mb-[1vh] text-[9vh] animate-crown-bounce" aria-hidden>
          👑
        </div>
      )}
      {isLucky && (
        <div className="mb-[1vh] text-[8vh] animate-wiggle" aria-hidden>
          🍀
        </div>
      )}

      {/* guest name */}
      <h2 className="animate-rise-in font-display text-[clamp(2rem,7vh,7rem)] font-semibold leading-tight text-white">
        <Name>{guest?.name ?? "…"}</Name>
      </h2>

      {/* the amount (forced LTR so "₪1,500" never flips in the RTL layout) */}
      <div className="animate-pop-in [animation-delay:120ms]">
        <div
          dir="ltr"
          className={cn(
            "mt-[1vh] font-display font-black leading-none tracking-tight",
            "text-[clamp(4rem,22vh,22rem)]",
            amountClass(tier)
          )}
        >
          {formatILS(amount)}
        </div>
      </div>

      {/* tier caption */}
      <p className="mt-[2vh] animate-rise-in text-[4vh] font-bold text-white/90 [animation-delay:260ms]">
        {tierLabel(tier)}
      </p>

      {isLucky && (
        <p className="mt-[1vh] text-[2.6vh] font-medium text-emerald-200/80">
          שבע-עשרה — המספר הכי בר-מזל ✨
        </p>
      )}
    </div>
  );
}

function auraClass(tier: AmountTier): string {
  switch (tier) {
    case "royal":
      return "bg-[radial-gradient(60vh_60vh_at_50%_42%,rgba(212,175,55,0.30),transparent_70%)]";
    case "lucky17":
      return "bg-[radial-gradient(60vh_60vh_at_50%_42%,rgba(16,185,129,0.28),transparent_70%)]";
    case "fireworks":
      return "bg-[radial-gradient(60vh_60vh_at_50%_42%,rgba(236,72,153,0.26),transparent_70%)]";
    case "confetti-big":
      return "bg-[radial-gradient(60vh_60vh_at_50%_42%,rgba(124,58,237,0.24),transparent_70%)]";
    case "confetti-small":
      return "bg-[radial-gradient(55vh_55vh_at_50%_42%,rgba(76,201,240,0.20),transparent_70%)]";
    case "sparkle":
    default:
      return "bg-[radial-gradient(50vh_50vh_at_50%_42%,rgba(212,175,55,0.16),transparent_70%)]";
  }
}

function amountClass(tier: AmountTier): string {
  switch (tier) {
    case "royal":
      return "text-gold-shimmer drop-shadow-[0_0_40px_rgba(212,175,55,0.55)]";
    case "lucky17":
      return "bg-clip-text text-transparent bg-[linear-gradient(100deg,#a7f3d0,#34d399,#ffd700,#34d399)] drop-shadow-[0_0_30px_rgba(16,185,129,0.45)]";
    case "fireworks":
      return "text-gold-shimmer drop-shadow-[0_0_30px_rgba(236,72,153,0.4)]";
    default:
      return "text-gold-gradient";
  }
}
