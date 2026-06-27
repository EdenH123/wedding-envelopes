"use client";

import { useEffect, useRef, useState } from "react";
import { cn, formatILS } from "@/lib/utils";

/**
 * Slot-machine style amount: spins through random numbers, then rolls into the
 * final value and flashes. Used for the big reveal amount.
 */
export function SlotNumber({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);
  const [spinning, setSpinning] = useState(true);
  const rafRef = useRef(0);

  useEffect(() => {
    setSpinning(true);
    // Never spin past the real value, so it never shows more digits (or a bigger
    // number) than the final amount.
    const ceil = Math.max(1, Math.round(value));
    const duration = 1300;
    let startTs = 0;

    const tick = (now: number) => {
      if (!startTs) startTs = now;
      const t = Math.min(1, (now - startTs) / duration);
      if (t < 0.5) {
        // fast random spin, bounded by the real value
        setDisplay(Math.floor(Math.random() * (ceil + 1)));
        rafRef.current = requestAnimationFrame(tick);
      } else if (t < 1) {
        // roll into the final value
        const p = (t - 0.5) / 0.5;
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(Math.round(value * eased));
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
        setSpinning(false);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return (
    <span className={cn("block", className, spinning ? "blur-[1.5px]" : "animate-count-flash")}>
      {formatILS(display)}
    </span>
  );
}
