"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

/**
 * A burst of coins that fly from the reveal down into the "pot" (stats bar).
 * Mounts fresh per reveal (the parent keys it), so the animation replays.
 *
 * Coins are generated only after mount (never during SSR) so the random
 * trajectories can't cause a hydration mismatch.
 */
export function CoinBurst({ count = 14 }: { count?: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const coins = useMemo(
    () =>
      mounted
        ? Array.from({ length: count }, () => ({
            dx: Math.random() * 44 - 22, // vw spread
            dy: 34 + Math.random() * 12, // vh downward (toward the stats bar)
            rot: Math.random() * 720 - 360,
            delay: Math.random() * 0.28,
            size: 2.4 + Math.random() * 1.6,
          }))
        : [],
    [mounted, count]
  );

  if (!mounted) return null;

  return (
    <div className="pointer-events-none absolute left-1/2 top-[42%] z-10">
      {coins.map((c, i) => (
        <span
          key={i}
          className="animate-coin-fly absolute"
          style={
            {
              fontSize: `${c.size}vh`,
              "--dx": `${c.dx}vw`,
              "--dy": `${c.dy}vh`,
              "--rot": `${c.rot}deg`,
              animationDelay: `${c.delay}s`,
            } as CSSProperties
          }
          aria-hidden
        >
          🪙
        </span>
      ))}
    </div>
  );
}
