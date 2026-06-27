"use client";

import { useEffect, useRef, useState } from "react";
import type { EventStats, Guest } from "@/lib/types";
import {
  computePaymentBreakdown,
  formatILS,
  formatNumber,
  paymentMethodEmoji,
  topGivers,
  type MethodTotal,
} from "@/lib/utils";
import { Name } from "@/components/Name";

// Floating ambient decorations (deterministic — no hydration mismatch).
const FLOATERS = [
  { e: "💰", left: "7%", top: "20%", d: "0s", s: "3.4vh" },
  { e: "✨", left: "18%", top: "72%", d: "1.1s", s: "2.6vh" },
  { e: "🎉", left: "82%", top: "26%", d: "0.6s", s: "3.2vh" },
  { e: "💌", left: "90%", top: "66%", d: "1.7s", s: "2.8vh" },
  { e: "✨", left: "50%", top: "8%", d: "2s", s: "2.2vh" },
  { e: "🎊", left: "11%", top: "46%", d: "1.4s", s: "2.6vh" },
];

/** Eased count-up from 0 → target whenever `target` changes. */
function useCountUp(target: number, duration = 1600): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    let startTs = 0;
    const tick = (now: number) => {
      if (!startTs) startTs = now;
      const t = Math.min(1, (now - startTs) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export function SummaryScreen({ guests, stats }: { guests: Guest[]; stats: EventStats }) {
  const total = useCountUp(stats.totalAmount);
  const breakdown = computePaymentBreakdown(guests);
  const leaders = topGivers(guests, 10);
  const podium = leaders.slice(0, 3);
  const rest = leaders.slice(3, 10);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-[2vh] overflow-hidden px-[3vw] py-[3vh] text-center">
      {/* ambient floaters */}
      {FLOATERS.map((f, i) => (
        <span
          key={i}
          className="pointer-events-none absolute animate-float-slow opacity-70"
          style={{ left: f.left, top: f.top, fontSize: f.s, animationDelay: f.d }}
          aria-hidden
        >
          {f.e}
        </span>
      ))}

      {/* title */}
      <h1 className="animate-rise-in font-display text-[clamp(2rem,6vh,5rem)] font-bold leading-none text-gold-shimmer">
        🎊 סיכום האירוע 🎊
      </h1>

      {/* hero total */}
      <div className="animate-pop-in [animation-delay:150ms]">
        <div className="text-[2.2vh] font-medium uppercase tracking-[0.3em] text-gold-300">
          סך הכל נאסף
        </div>
        <div
          dir="ltr"
          className="num text-gold-shimmer font-display text-[clamp(3.5rem,17vh,16rem)] font-black leading-none drop-shadow-[0_0_50px_rgba(212,175,55,0.5)]"
        >
          {formatILS(Math.round(total))}
        </div>
        <div className="mt-[0.5vh] text-[2.8vh] text-white/70">
          <span className="num">{formatNumber(stats.openedCount)}</span> מעטפות · ממוצע{" "}
          <span className="num">
            {stats.openedCount > 0 ? formatILS(Math.round(stats.averageAmount)) : "—"}
          </span>
        </div>
      </div>

      {/* podium */}
      {podium.length > 0 && (
        <div className="flex items-end justify-center gap-[1.5vw]">
          {[podium[1], podium[0], podium[2]].map((g, idx) => {
            if (!g) return <div key={idx} className="w-[16vw]" />;
            const rank = g === podium[0] ? 0 : g === podium[1] ? 1 : 2;
            return <PodiumColumn key={g.id} guest={g} rank={rank} />;
          })}
        </div>
      )}

      {/* payment method breakdown */}
      <div className="grid w-full max-w-[80vw] grid-cols-3 gap-[1.2vw] animate-rise-in [animation-delay:500ms]">
        <MethodTile emoji="📱" label="ביט" total={breakdown.bit} />
        <MethodTile emoji="💵" label="מזומן" total={breakdown.cash} />
        <MethodTile emoji="🧾" label="צ׳ק" total={breakdown.check} />
      </div>

      {/* ranks 4–10 */}
      {rest.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-x-[1.6vw] gap-y-[0.6vh] animate-rise-in [animation-delay:650ms]">
          {rest.map((g, i) => (
            <span key={g.id} className="text-[2vh] text-white/65">
              <span className="num text-gold-300">{i + 4}.</span>{" "}
              <span className="font-semibold text-white/85">
                <Name>{g.name}</Name>
              </span>{" "}
              <span className="num text-gold-gradient font-bold">{formatILS(g.amount)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const PODIUM = [
  { medal: "🥇", h: "h-[20vh]", bar: "from-gold-300 to-gold-600", ring: "border-gold-400/70" },
  { medal: "🥈", h: "h-[15vh]", bar: "from-slate-200 to-slate-400", ring: "border-slate-300/60" },
  { medal: "🥉", h: "h-[11vh]", bar: "from-amber-600 to-amber-800", ring: "border-amber-500/60" },
];

function PodiumColumn({ guest, rank }: { guest: Guest; rank: number }) {
  const p = PODIUM[rank];
  return (
    <div
      className="flex w-[20vw] max-w-[16rem] flex-col items-center animate-rise-in"
      style={{ animationDelay: `${250 + rank * 120}ms` }}
    >
      <div className="mb-[0.5vh] max-w-full truncate text-[2.4vh] font-bold text-white">
        <Name>{guest.name}</Name>
      </div>
      <div className="num text-gold-gradient text-[2.8vh] font-extrabold">{formatILS(guest.amount)}</div>
      <div
        className={`mt-[0.8vh] flex w-full items-start justify-center rounded-t-2xl border-x border-t bg-gradient-to-b ${p.bar} ${p.h} ${p.ring}`}
      >
        <span className="mt-[1vh] text-[4.5vh] drop-shadow">{p.medal}</span>
      </div>
    </div>
  );
}

function MethodTile({ emoji, label, total }: { emoji: string; label: string; total: MethodTotal }) {
  return (
    <div className="card-glass flex flex-col items-center justify-center p-[1.6vh]">
      <div className="text-[2.2vh] font-semibold text-white/80">
        <span aria-hidden>{emoji}</span> {label}
      </div>
      <div className="num text-gold-gradient text-[3.6vh] font-extrabold leading-tight">
        {formatILS(total.sum)}
      </div>
      <div className="num text-[1.8vh] text-white/45">
        {total.count} {total.count === 1 ? "מעטפה" : "מעטפות"}
      </div>
    </div>
  );
}
