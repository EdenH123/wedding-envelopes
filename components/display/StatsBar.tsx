"use client";

import { useEffect, useRef, useState } from "react";
import type { EventStats } from "@/lib/types";
import { formatILS, formatNumber } from "@/lib/utils";
import { useCountUp } from "@/lib/useCountUp";
import { Name } from "@/components/Name";

/**
 * Always-visible live statistics, anchored at the bottom of the display.
 * The total + opened count roll up on each reveal, and a new "King" gets a
 * crown hand-off animation.
 */
export function StatsBar({ stats }: { stats: EventStats }) {
  const total = useCountUp(stats.totalAmount, { duration: 1100 });
  const opened = useCountUp(stats.openedCount, { duration: 700 });

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-[2vw] pb-[2vh]">
      <div className="card-glass mx-auto flex max-w-[96vw] flex-wrap items-stretch justify-center gap-[1.2vw] p-[1.4vh]">
        <Stat
          icon="💌"
          label="מעטפות שנפתחו"
          value={`${formatNumber(Math.round(opened))} / ${formatNumber(stats.totalGuests)}`}
        />
        <Divider />
        <Stat icon="💰" label="סך הכל עד כה" value={formatILS(Math.round(total))} accent />
        <Divider />
        <Stat
          icon="📊"
          label="מתנה ממוצעת"
          value={stats.openedCount > 0 ? formatILS(Math.round(stats.averageAmount)) : "—"}
        />
        <Divider />
        <KingStat stats={stats} />
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex min-w-[9rem] flex-1 flex-col items-center justify-center px-[1vw] text-center">
      <div className="text-[1.6vh] font-medium uppercase tracking-wider text-white/55">
        <span aria-hidden className="me-1.5">
          {icon}
        </span>
        {label}
      </div>
      <div
        className={
          accent
            ? "num text-gold-gradient text-[3.4vh] font-extrabold leading-tight"
            : "num text-[3.4vh] font-extrabold leading-tight text-white"
        }
      >
        {value}
      </div>
    </div>
  );
}

function KingStat({ stats }: { stats: EventStats }) {
  const kingId = stats.king?.id ?? null;
  const [crowning, setCrowning] = useState(false);
  const prevKingId = useRef<string | null>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    // Skip the very first render (initial data load shouldn't celebrate).
    if (firstRun.current) {
      firstRun.current = false;
      prevKingId.current = kingId;
      return;
    }
    if (kingId && kingId !== prevKingId.current) {
      setCrowning(true);
      const t = setTimeout(() => setCrowning(false), 3200);
      prevKingId.current = kingId;
      return () => clearTimeout(t);
    }
    prevKingId.current = kingId;
  }, [kingId]);

  return (
    <div
      className={`relative flex min-w-[12rem] flex-1 flex-col items-center justify-center px-[1vw] text-center transition ${
        crowning ? "rounded-xl bg-gold-500/10 ring-1 ring-gold-400/50" : ""
      }`}
    >
      {/* crown hand-off */}
      {crowning && (
        <>
          <div className="pointer-events-none absolute -top-[5vh] z-10 text-[5vh] animate-drop-in" aria-hidden>
            👑
          </div>
          <div className="pointer-events-none absolute -top-[1.4vh] z-10 animate-pop-in rounded-full bg-gold-500 px-2 py-0.5 text-[1.5vh] font-bold text-ink-900 shadow-glow-sm">
            מלך חדש!
          </div>
        </>
      )}

      <div className="text-[1.6vh] font-medium uppercase tracking-wider text-gold-300">
        👑 מלך המעטפות
      </div>
      {stats.king ? (
        <div className="flex items-baseline gap-2">
          <span
            className={`max-w-[16vw] truncate text-[2.6vh] font-bold text-white ${
              crowning ? "animate-count-flash" : ""
            }`}
          >
            <Name>{stats.king.name}</Name>
          </span>
          <span className="num text-gold-gradient text-[3vh] font-extrabold">
            {formatILS(stats.king.amount)}
          </span>
        </div>
      ) : (
        <div className="text-[2.6vh] font-semibold text-white/40">ממתינים לאלוף…</div>
      )}
    </div>
  );
}

function Divider() {
  return <div className="hidden w-px self-stretch bg-white/10 sm:block" />;
}
