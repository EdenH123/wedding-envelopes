"use client";

import type { EventStats } from "@/lib/types";
import { formatILS, formatNumber } from "@/lib/utils";
import { Name } from "@/components/Name";

export function StatsStrip({
  stats,
  onExport,
}: {
  stats: EventStats;
  onExport: () => void;
}) {
  return (
    <section className="card-glass p-4">
      <div className="grid grid-cols-3 gap-3 text-center">
        <Mini label="נפתחו" value={`${formatNumber(stats.openedCount)}/${formatNumber(stats.totalGuests)}`} />
        <Mini label="סך הכל" value={formatILS(stats.totalAmount)} accent />
        <Mini
          label="ממוצע"
          value={stats.openedCount > 0 ? formatILS(Math.round(stats.averageAmount)) : "—"}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-black/20 px-3 py-2">
        <div className="min-w-0 text-sm">
          <span className="text-gold-300">👑 מלך:</span>{" "}
          {stats.king ? (
            <span className="font-semibold text-white">
              <Name>{stats.king.name}</Name>{" "}
              <span className="num text-gold-gradient">{formatILS(stats.king.amount)}</span>
            </span>
          ) : (
            <span className="text-white/40">אין עדיין</span>
          )}
        </div>
        <button type="button" className="btn-outline shrink-0 text-sm" onClick={onExport}>
          ⬇️ ייצוא
        </button>
      </div>
    </section>
  );
}

function Mini({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-white/45">{label}</div>
      <div className={accent ? "num text-gold-gradient text-lg font-extrabold" : "num text-lg font-extrabold text-white"}>
        {value}
      </div>
    </div>
  );
}
