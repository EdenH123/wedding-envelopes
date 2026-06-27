import type { Guest } from "@/lib/types";
import { cn, formatILS, getAmountTier, tierLabel, type AmountTier } from "@/lib/utils";
import { Name } from "@/components/Name";
import { RouletteWheel } from "./RouletteWheel";
import { SlotNumber } from "./SlotNumber";
import { Shockwave } from "./Shockwave";
import { CoinBurst } from "./CoinBurst";
import { EnvelopeOpenFx } from "./EnvelopeOpenFx";

// Ambient twinkle positions (deterministic).
const TWINKLES = ["6%", "16%", "30%", "44%", "58%", "72%", "84%", "92%"];

const COIN_COUNT: Record<AmountTier, number> = {
  sparkle: 6,
  "confetti-small": 9,
  "confetti-big": 13,
  fireworks: 17,
  royal: 24,
  lucky17: 18,
};

export function RevealScreen({ guest }: { guest: Guest | null }) {
  const amount = guest?.amount ?? 0;
  const tier = getAmountTier(amount);
  const isKingTier = tier === "royal";
  const isLucky = tier === "lucky17";

  const amountSize = isLucky ? "text-[clamp(3rem,13vh,11rem)]" : "text-[clamp(4rem,22vh,22rem)]";
  const amountCls = cn(
    "mt-[1vh] font-display font-black leading-none tracking-tight",
    amountSize,
    amountClass(tier)
  );

  return (
    <div
      // `key` (set on this element) forces every child — including the effect
      // components — to remount on each new reveal, replaying their animations.
      key={`${guest?.id}-${guest?.updated_at}`}
      className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center"
    >
      {/* tier-colored aura behind everything */}
      <div className={cn("absolute inset-0 -z-10", auraClass(tier))} />

      {/* shockwave ripple + screen flash */}
      <Shockwave tier={tier} />

      {/* coins fly into the pot */}
      <CoinBurst count={COIN_COUNT[tier]} />

      {/* envelope tears open (not for lucky — the roulette wheel is its intro) */}
      {!isLucky && <EnvelopeOpenFx />}

      {/* ambient twinkles */}
      {TWINKLES.map((left, i) => (
        <span
          key={i}
          className="pointer-events-none absolute top-[12%] animate-twinkle text-[2.4vh]"
          style={{ left, animationDelay: `${(i % 4) * 0.35}s` }}
          aria-hidden
        >
          {isLucky ? "🎲" : "✨"}
        </span>
      ))}

      {/* tier decoration */}
      {isKingTier && (
        <div className="mb-[1vh] text-[9vh] animate-crown-bounce" aria-hidden>
          👑
        </div>
      )}
      {isLucky && <RouletteWheel className="mb-[1.5vh] h-[clamp(11rem,26vh,21rem)]" />}

      {/* guest name */}
      <h2
        className={cn(
          "animate-rise-in font-display font-semibold leading-tight text-white",
          isLucky ? "text-[clamp(1.5rem,4.5vh,3.5rem)]" : "text-[clamp(2rem,7vh,7rem)]"
        )}
      >
        <Name>{guest?.name ?? "…"}</Name>
      </h2>

      {/* the amount (forced LTR so "₪1,500" never flips in the RTL layout) */}
      <div dir="ltr" className="animate-pop-in [animation-delay:120ms]">
        {isLucky ? (
          <div className={amountCls}>{formatILS(amount)}</div>
        ) : (
          <SlotNumber value={amount} className={amountCls} />
        )}
      </div>

      {/* tier caption */}
      <p className="mt-[2vh] animate-rise-in text-[4vh] font-bold text-white/90 [animation-delay:260ms]">
        {tierLabel(tier)}
      </p>

      {isLucky && (
        <p className="mt-[1vh] text-[2.6vh] font-medium text-gold-200/85">
          המספר המנצח ברולטה — מזל של אלופים! 🎡
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
      return "bg-[radial-gradient(70vh_70vh_at_50%_45%,rgba(220,38,38,0.32),transparent_70%)]";
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
      return "animate-neon-flicker bg-clip-text text-transparent bg-[linear-gradient(100deg,#fca5a5,#ef4444,#facc15,#ef4444)] drop-shadow-[0_0_35px_rgba(239,68,68,0.55)]";
    case "fireworks":
      return "text-gold-shimmer drop-shadow-[0_0_30px_rgba(236,72,153,0.4)]";
    default:
      return "text-gold-gradient";
  }
}
