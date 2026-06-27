"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates a number toward `target`. By default it rolls from the previously
 * shown value to the new target (so the live total "adds up" on each reveal).
 * With `animateOnMount`, it counts from 0 on first render (used for the big
 * summary total).
 */
export function useCountUp(
  target: number,
  { duration = 900, animateOnMount = false }: { duration?: number; animateOnMount?: boolean } = {}
): number {
  const [value, setValue] = useState(animateOnMount ? 0 : target);
  const valueRef = useRef(value);
  const rafRef = useRef(0);

  // Keep a ref to the latest displayed value so the animation can start from it.
  useEffect(() => {
    valueRef.current = value;
  });

  useEffect(() => {
    const from = valueRef.current;
    if (Math.round(from) === Math.round(target)) {
      setValue(target);
      return;
    }
    let startTs = 0;
    const tick = (now: number) => {
      if (!startTs) startTs = now;
      const t = Math.min(1, (now - startTs) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(from + (target - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else setValue(target);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}
