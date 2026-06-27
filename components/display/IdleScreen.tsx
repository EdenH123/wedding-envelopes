import type { EventStats } from "@/lib/types";
import { formatILS } from "@/lib/utils";

// Deterministic decorative positions (no Math.random → no hydration mismatch).
const FLOATERS = [
  { emoji: "💌", left: "8%", top: "18%", delay: "0s", size: "3.5vh" },
  { emoji: "✨", left: "22%", top: "70%", delay: "1.2s", size: "2.6vh" },
  { emoji: "🎊", left: "78%", top: "22%", delay: "0.6s", size: "3.2vh" },
  { emoji: "💛", left: "88%", top: "64%", delay: "1.8s", size: "2.8vh" },
  { emoji: "✨", left: "50%", top: "12%", delay: "2.1s", size: "2.2vh" },
  { emoji: "🎊", left: "14%", top: "44%", delay: "1.5s", size: "2.6vh" },
  { emoji: "💌", left: "66%", top: "78%", delay: "0.9s", size: "3vh" },
];

export function IdleScreen({ stats }: { stats: EventStats }) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center">
      {/* floating decorations */}
      {FLOATERS.map((f, i) => (
        <span
          key={i}
          className="pointer-events-none absolute animate-float-slow opacity-70"
          style={{ left: f.left, top: f.top, fontSize: f.size, animationDelay: f.delay }}
          aria-hidden
        >
          {f.emoji}
        </span>
      ))}

      <div className="relative z-10 animate-rise-in">
        <div className="mb-2 text-[7vh] animate-float">💌</div>
        <h1 className="font-display text-[10vh] font-bold leading-none tracking-wide text-gold-shimmer">
          מופע המעטפות
        </h1>
        <p className="mt-[3vh] text-[3.4vh] font-light text-white/75">
          ממתינים למעטפה הבאה<span className="animate-pulse">…</span>
        </p>

        {stats.openedCount > 0 && (
          <p className="mt-[2vh] text-[2.4vh] text-white/45">
            נפתחו <span className="num">{stats.openedCount}</span> מעטפות ·{" "}
            <span className="num">{formatILS(stats.totalAmount)}</span> עד כה 🎉
          </p>
        )}
      </div>
    </div>
  );
}
