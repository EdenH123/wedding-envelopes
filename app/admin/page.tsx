"use client";

import { useState } from "react";
import Link from "next/link";
import { useEventShow } from "@/lib/useEventShow";
import { exportGuestsToExcel } from "@/lib/excel";
import { SetupNotice } from "@/components/SetupNotice";
import { ExcelUpload } from "@/components/admin/ExcelUpload";
import { QuickAdd } from "@/components/admin/QuickAdd";
import { GuestSearch } from "@/components/admin/GuestSearch";
import { SelectedPanel } from "@/components/admin/SelectedPanel";
import { StatsStrip } from "@/components/admin/StatsStrip";
import { SummaryModal } from "@/components/admin/SummaryModal";

export default function AdminPage() {
  const show = useEventShow();
  const [summaryOpen, setSummaryOpen] = useState(false);

  if (!show.configured) return <SetupNotice />;

  return (
    <main className="bg-stage min-h-screen">
      <div className="mx-auto w-full max-w-xl px-4 pb-16 pt-4">
        {/* Header */}
        <header className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-gold-gradient">מופע המעטפות</h1>
            <div className="flex items-center gap-1.5 text-xs text-white/45">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  show.connected ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              {show.connected ? "מחובר" : show.loading ? "מתחבר…" : "מתחבר מחדש…"}
              <span className="text-white/25">·</span>
              ניהול
            </div>
          </div>
          <Link href="/display" target="_blank" className="btn-outline text-sm">
            פתח תצוגה ↗
          </Link>
        </header>

        {show.error && (
          <div className="mb-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {show.error}
          </div>
        )}

        {show.loading ? (
          <div className="card-glass p-10 text-center text-white/60">טוען מוזמנים…</div>
        ) : (
          <div className="space-y-4">
            <StatsStrip stats={show.stats} onExport={() => exportGuestsToExcel(show.guests)} />

            {/* Sticky so the live controls stay reachable while scrolling the list */}
            <div className="sticky top-2 z-20">
              <SelectedPanel
                guest={show.selectedGuest}
                status={show.eventState?.screen_status ?? "idle"}
                onReveal={show.revealAmount}
                onReady={show.setReady}
                onClear={show.clearSelection}
                onUndo={show.undoLastReveal}
              />
            </div>

            <GuestSearch
              guests={show.guests}
              selectedId={show.eventState?.selected_guest_id ?? null}
              onSelect={show.selectGuest}
              onDelete={show.deleteGuest}
            />

            <QuickAdd onAddAndReveal={show.addAndReveal} />

            <ExcelUpload onImport={show.importGuests} />

            {/* End-of-event summary */}
            <button
              type="button"
              onClick={() => setSummaryOpen(true)}
              className="btn-gold w-full py-4 text-lg"
            >
              📊 סיכום האירוע
            </button>
          </div>
        )}

        <footer className="mt-8 text-center text-xs text-white/30">
          💌 מופע המעטפות · לכבוד חתונת המשפחה
        </footer>
      </div>

      <SummaryModal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        guests={show.guests}
        stats={show.stats}
        onExport={() => exportGuestsToExcel(show.guests)}
      />
    </main>
  );
}
