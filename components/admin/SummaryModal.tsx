"use client";

import { useEffect } from "react";
import type { EventStats, Guest } from "@/lib/types";
import {
  computePaymentBreakdown,
  formatILS,
  formatNumber,
  paymentMethodEmoji,
  paymentMethodLabel,
  topGivers,
  type MethodTotal,
} from "@/lib/utils";
import { Name } from "@/components/Name";

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export function SummaryModal({
  open,
  onClose,
  guests,
  stats,
  onExport,
}: {
  open: boolean;
  onClose: () => void;
  guests: Guest[];
  stats: EventStats;
  onExport: () => void;
}) {
  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const breakdown = computePaymentBreakdown(guests);
  const leaders = topGivers(guests, 10);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="סיכום האירוע"
    >
      <div
        className="card-glass my-4 w-full max-w-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold text-gold-gradient">📊 סיכום האירוע</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגירה"
            className="rounded-lg px-3 py-1.5 text-white/60 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* headline stats — total as a full-width hero so large sums never clip */}
        <div className="mt-4 space-y-2">
          <div className="rounded-xl border border-gold-500/30 bg-gold-500/10 p-4 text-center">
            <div className="text-xs uppercase tracking-wide text-gold-300">סך הכל</div>
            <div className="num text-gold-gradient mt-1 font-black leading-none text-[clamp(1.75rem,8vw,2.75rem)]">
              {formatILS(stats.totalAmount)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <BigStat label="מעטפות שנפתחו" value={formatNumber(stats.openedCount)} />
            <BigStat
              label="ממוצע למעטפה"
              value={stats.openedCount > 0 ? formatILS(Math.round(stats.averageAmount)) : "—"}
            />
          </div>
        </div>

        {/* payment method breakdown */}
        <h3 className="mt-6 mb-2 text-sm font-bold uppercase tracking-wide text-white/55">
          לפי אמצעי תשלום
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <MethodCard emoji="📱" label="ביט" total={breakdown.bit} />
          <MethodCard emoji="💵" label="מזומן" total={breakdown.cash} />
          <MethodCard emoji="🧾" label="צ׳ק" total={breakdown.check} />
        </div>
        {breakdown.unspecified.count > 0 && (
          <p className="mt-2 text-xs text-white/40">
            + <span className="num">{breakdown.unspecified.count}</span> ללא אמצעי תשלום (
            <span className="num">{formatILS(breakdown.unspecified.sum)}</span>)
          </p>
        )}

        {/* leaderboard */}
        <h3 className="mt-6 mb-2 text-sm font-bold uppercase tracking-wide text-white/55">
          👑 טופ 10 מעטפות
        </h3>
        {leaders.length === 0 ? (
          <p className="py-6 text-center text-sm text-white/40">עדיין לא נפתחו מעטפות.</p>
        ) : (
          <ol className="space-y-1.5">
            {leaders.map((g, i) => (
              <li
                key={g.id}
                className={
                  i === 0
                    ? "flex items-center gap-3 rounded-xl border border-gold-500/40 bg-gold-500/10 px-3 py-2"
                    : "flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2"
                }
              >
                <span className="w-7 shrink-0 text-center text-base font-bold">
                  {RANK_MEDALS[i] ?? <span className="num text-white/50">{i + 1}</span>}
                </span>
                <span className="min-w-0 flex-1 truncate font-semibold text-white">
                  <Name>{g.name}</Name>
                </span>
                {g.payment_method && (
                  <span className="shrink-0 text-xs text-white/45">
                    {paymentMethodEmoji(g.payment_method)} {paymentMethodLabel(g.payment_method)}
                  </span>
                )}
                <span className="num shrink-0 text-gold-gradient font-bold">{formatILS(g.amount)}</span>
              </li>
            ))}
          </ol>
        )}

        {/* actions */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button type="button" className="btn-gold flex-1" onClick={onExport}>
            ⬇️ ייצוא לאקסל
          </button>
          <button type="button" className="btn-outline flex-1" onClick={onClose}>
            סגירה
          </button>
        </div>
      </div>
    </div>
  );
}

function BigStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-black/20 p-3 text-center">
      <div className="text-[11px] uppercase tracking-wide text-white/45">{label}</div>
      <div
        className={
          accent
            ? "num text-gold-gradient mt-0.5 text-xl font-extrabold leading-tight"
            : "num mt-0.5 text-xl font-extrabold leading-tight text-white"
        }
      >
        {value}
      </div>
    </div>
  );
}

function MethodCard({ emoji, label, total }: { emoji: string; label: string; total: MethodTotal }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
      <div className="text-sm font-medium text-white/70">
        <span aria-hidden>{emoji}</span> {label}
      </div>
      <div className="num mt-1 text-base font-extrabold leading-tight text-white">
        {formatILS(total.sum)}
      </div>
      <div className="num text-xs text-white/40">
        {total.count} {total.count === 1 ? "מעטפה" : "מעטפות"}
      </div>
    </div>
  );
}
