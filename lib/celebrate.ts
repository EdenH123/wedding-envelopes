import confetti from "canvas-confetti";
import type { AmountTier } from "./utils";

const GOLD = ["#d4af37", "#f6e9c4", "#e7bd57", "#fff3c4", "#b8902b", "#ffe9a8"];
const FESTIVE = ["#ff5d8f", "#ffd166", "#06d6a0", "#4cc9f0", "#f72585", "#ffd700", "#9b5de5"];
// Casino palette for the roulette "Lucky 17" reveal: red, gold, black, white.
const LUCKY = ["#e11d48", "#facc15", "#dc2626", "#d4af37", "#ffffff", "#111111"];

const noop = () => {};

/**
 * Fire the celebration for a given amount tier.
 * Returns a cleanup function that cancels any ongoing animation loop — call it
 * before starting the next reveal or on unmount.
 */
export function runCelebration(tier: AmountTier): () => void {
  if (typeof window === "undefined") return noop;

  switch (tier) {
    case "sparkle":
      sparkle();
      return noop;
    case "confetti-small":
      burst(90, FESTIVE);
      return noop;
    case "confetti-big":
      bigBurst();
      return noop;
    case "fireworks":
      return fireworks(4000);
    case "royal":
      return royal(5000);
    case "lucky17":
      return lucky17(5000);
    default:
      return noop;
  }
}

function sparkle() {
  confetti({
    particleCount: 28,
    spread: 55,
    startVelocity: 22,
    scalar: 0.7,
    gravity: 0.6,
    ticks: 120,
    origin: { y: 0.6 },
    colors: GOLD,
  });
}

function burst(particleCount: number, colors: string[]) {
  confetti({
    particleCount,
    spread: 75,
    startVelocity: 38,
    origin: { y: 0.6 },
    colors,
  });
}

function bigBurst() {
  const base = { startVelocity: 45, ticks: 200, colors: FESTIVE };
  confetti({ ...base, particleCount: 120, spread: 100, origin: { x: 0.5, y: 0.6 } });
  confetti({ ...base, particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: 0.7 } });
  confetti({ ...base, particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.7 } });
}

function fireworks(durationMs: number): () => void {
  const animationEnd = nowPlus(durationMs);
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - performance.now();
    if (timeLeft <= 0) {
      window.clearInterval(interval);
      return;
    }
    const particleCount = 60 * (timeLeft / durationMs);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: rand(0.1, 0.4), y: rand(0.1, 0.5) },
      colors: FESTIVE,
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: rand(0.6, 0.9), y: rand(0.1, 0.5) },
      colors: FESTIVE,
    });
  }, 280);

  return () => window.clearInterval(interval);
}

function royal(durationMs: number): () => void {
  // Gold shower from the top + periodic regal bursts.
  const animationEnd = nowPlus(durationMs);
  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - performance.now();
    if (timeLeft <= 0) {
      window.clearInterval(interval);
      return;
    }
    confetti({
      particleCount: 6,
      angle: 90,
      spread: 120,
      startVelocity: 28,
      gravity: 0.8,
      scalar: 1.2,
      origin: { x: rand(0, 1), y: -0.1 },
      colors: GOLD,
    });
  }, 120);

  // Two grand opening bursts.
  confetti({ particleCount: 160, spread: 120, startVelocity: 50, origin: { y: 0.6 }, colors: GOLD });
  window.setTimeout(
    () => confetti({ particleCount: 120, spread: 140, startVelocity: 45, origin: { y: 0.5 }, colors: GOLD }),
    400
  );

  return () => window.clearInterval(interval);
}

function lucky17(durationMs: number): () => void {
  // Green + gold clover-style celebration with repeated lucky bursts.
  const animationEnd = nowPlus(durationMs);
  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - performance.now();
    if (timeLeft <= 0) {
      window.clearInterval(interval);
      return;
    }
    confetti({
      particleCount: 40,
      spread: 100,
      startVelocity: 40,
      scalar: 1.1,
      origin: { x: rand(0.2, 0.8), y: rand(0.2, 0.5) },
      colors: LUCKY,
      shapes: ["circle", "square"],
    });
  }, 350);

  confetti({ particleCount: 170, spread: 130, startVelocity: 48, origin: { y: 0.6 }, colors: LUCKY });

  return () => window.clearInterval(interval);
}

/**
 * A sustained celebratory shower for the event summary "finale" screen — gold +
 * festive confetti drifting from both top corners. Returns a cleanup function.
 */
export function runFinale(durationMs = 9000): () => void {
  if (typeof window === "undefined") return noop;

  const animationEnd = nowPlus(durationMs);
  const colors = [...GOLD, ...FESTIVE];

  // Two grand opening bursts.
  confetti({ particleCount: 180, spread: 120, startVelocity: 55, origin: { y: 0.55 }, colors });
  window.setTimeout(
    () => confetti({ particleCount: 140, spread: 140, startVelocity: 45, origin: { y: 0.5 }, colors }),
    500
  );

  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - performance.now();
    if (timeLeft <= 0) {
      window.clearInterval(interval);
      return;
    }
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 70,
      startVelocity: 45,
      origin: { x: 0, y: 0 },
      colors,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 70,
      startVelocity: 45,
      origin: { x: 1, y: 0 },
      colors,
    });
  }, 250);

  return () => window.clearInterval(interval);
}

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function nowPlus(ms: number): number {
  return performance.now() + ms;
}
