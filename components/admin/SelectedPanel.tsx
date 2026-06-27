"use client";

import { useEffect, useState } from "react";
import type { Guest, ScreenStatus } from "@/lib/types";
import type { ActionResult } from "@/lib/useEventShow";
import { formatILS } from "@/lib/utils";
import { Name } from "@/components/Name";

const QUICK_AMOUNTS = [200, 360, 500, 1000, 1500, 1717];

export function SelectedPanel({
  guest,
  status,
  onReveal,
  onReady,
  onClear,
  onUndo,
}: {
  guest: Guest | null;
  status: ScreenStatus;
  onReveal: (id: string, amount: number) => Promise<ActionResult>;
  onReady: () => Promise<ActionResult>;
  onClear: () => Promise<ActionResult>;
  onUndo: () => Promise<ActionResult>;
}) {
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync the input when a different guest is selected (prefill if already opened).
  useEffect(() => {
    setError(null);
    setAmount(guest && typeof guest.amount === "number" ? String(guest.amount) : "");
  }, [guest?.id, guest?.amount]);

  if (!guest) {
    return (
      <section className="card-gold p-5 text-center">
        <p className="text-sm text-white/60">
          👆 בחרו מוזמן מהרשימה כדי להציג אותו על המסך הגדול.
        </p>
      </section>
    );
  }

  async function run(key: string, fn: () => Promise<ActionResult>) {
    setError(null);
    setBusy(key);
    const res = await fn();
    setBusy(null);
    if (!res.ok) setError(res.error ?? "משהו השתבש.");
  }

  async function reveal() {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("הזינו סכום תקין.");
      return;
    }
    await run("reveal", () => onReveal(guest!.id, value));
  }

  const revealed = status === "revealed" && guest.opened;

  return (
    <section className="card-gold p-5">
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-gold-300">על המסך הגדול</div>
          <div className="truncate text-2xl font-extrabold text-white">
            🎊 <Name>{guest.name}</Name>
          </div>
          <StatusLine status={status} opened={guest.opened} amount={guest.amount} />
        </div>
      </div>

      {/* amount entry */}
      <div className="mt-4">
        <label className="mb-1 block text-sm font-medium text-white/70">סכום (₪)</label>
        <input
          className="input num text-lg"
          placeholder="לדוגמה 1500"
          inputMode="numeric"
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void reveal();
          }}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              className="chip num border border-white/15 bg-white/[0.04] text-white/80 hover:bg-white/10"
              onClick={() => setAmount(String(a))}
            >
              {formatILS(a)}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

      {/* primary action */}
      <button
        type="button"
        className="btn-gold mt-4 w-full text-lg"
        disabled={busy !== null}
        onClick={reveal}
      >
        {busy === "reveal" ? "חושף…" : revealed ? "עדכון סכום 🔁" : "חשיפה / הוספת סכום 🎉"}
      </button>

      {/* secondary controls */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="btn-outline"
          disabled={busy !== null || status === "ready"}
          onClick={() => run("ready", onReady)}
        >
          {busy === "ready" ? "…" : "סימון כמוכן 🥁"}
        </button>
        <button
          type="button"
          className="btn-outline"
          disabled={busy !== null || !guest.opened}
          onClick={() => run("undo", onUndo)}
        >
          {busy === "undo" ? "…" : "ביטול סכום ↩︎"}
        </button>
      </div>
      <button
        type="button"
        className="btn-ghost mt-2 w-full"
        disabled={busy !== null}
        onClick={() => run("clear", onClear)}
      >
        {busy === "clear" ? "…" : "ניקוי / חזרה למסך הבית ✖"}
      </button>
    </section>
  );
}

function StatusLine({
  status,
  opened,
  amount,
}: {
  status: ScreenStatus;
  opened: boolean;
  amount: number | null;
}) {
  const labels: Record<ScreenStatus, string> = {
    idle: "מסך הבית",
    selected: "נבחר — ממתין",
    ready: "מוכן 🥁",
    revealed: "נחשף 🎉",
  };
  return (
    <div className="mt-1 text-sm text-white/55">
      {labels[status]}
      {opened && typeof amount === "number" && (
        <span className="num text-gold-gradient ms-2 font-semibold">{formatILS(amount)}</span>
      )}
    </div>
  );
}
