import type { EventStats } from "@/lib/types";
import { formatILS, formatNumber } from "@/lib/utils";
import { Name } from "@/components/Name";

/**
 * Always-visible live statistics, anchored at the bottom of the display.
 * Designed to be legible from across a room on a large TV.
 */
export function StatsBar({ stats }: { stats: EventStats }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-[2vw] pb-[2vh]">
      <div className="card-glass mx-auto flex max-w-[96vw] flex-wrap items-stretch justify-center gap-[1.2vw] p-[1.4vh]">
        <Stat
          icon="💌"
          label="מעטפות שנפתחו"
          value={`${formatNumber(stats.openedCount)} / ${formatNumber(stats.totalGuests)}`}
        />
        <Divider />
        <Stat icon="💰" label="סך הכל עד כה" value={formatILS(stats.totalAmount)} accent />
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
  return (
    <div className="flex min-w-[12rem] flex-1 flex-col items-center justify-center px-[1vw] text-center">
      <div className="text-[1.6vh] font-medium uppercase tracking-wider text-gold-300">
        👑 מלך המעטפות
      </div>
      {stats.king ? (
        <div className="flex items-baseline gap-2">
          <span className="max-w-[16vw] truncate text-[2.6vh] font-bold text-white">
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
