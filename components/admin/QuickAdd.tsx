"use client";

import { useState } from "react";
import type { ActionResult } from "@/lib/useEventShow";

export function QuickAdd({
  onAddAndReveal,
}: {
  onAddAndReveal: (name: string, amount: number) => Promise<ActionResult>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    const trimmed = name.trim();
    const value = Number(amount);
    if (!trimmed) {
      setError("הזינו שם.");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setError("הזינו סכום תקין.");
      return;
    }
    setBusy(true);
    const res = await onAddAndReveal(trimmed, value);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "לא ניתן להוסיף מוזמן.");
      return;
    }
    setName("");
    setAmount("");
    setOpen(false);
  }

  return (
    <section className="card-glass p-4">
      <button
        type="button"
        className="flex w-full items-center justify-between"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-base font-bold text-white">➕ הוספת מוזמן מהירה</span>
        <span className="text-white/50">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <input
            className="input"
            placeholder="שם המוזמן"
            dir="auto"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="input num"
            placeholder="סכום (₪)"
            inputMode="numeric"
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submit();
            }}
          />
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button type="button" className="btn-gold w-full" disabled={busy} onClick={submit}>
            {busy ? "מוסיף…" : "הוספה וחשיפה 🎉"}
          </button>
          <p className="text-xs text-white/40">
            מוסיף את המוזמן, מסמן את המעטפה כפתוחה, וחושף אותה מיד על הטלוויזיה.
          </p>
        </div>
      )}
    </section>
  );
}
