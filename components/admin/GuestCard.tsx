"use client";

import { useState } from "react";
import type { Guest } from "@/lib/types";
import { cn, formatILS, paymentMethodEmoji, paymentMethodLabel } from "@/lib/utils";
import { Name } from "@/components/Name";

export function GuestCard({
  guest,
  selected,
  onSelect,
  onDelete,
}: {
  guest: Guest;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div
      className={cn(
        "flex items-stretch gap-1 rounded-xl border transition",
        selected
          ? "border-gold-500/70 bg-gold-500/15 shadow-glow-sm"
          : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
      )}
    >
      {/* main (select) */}
      <button
        type="button"
        onClick={() => onSelect(guest.id)}
        className="flex min-w-0 flex-1 items-center justify-between gap-3 p-3 text-start active:scale-[0.99]"
      >
        <div className="min-w-0">
          <div className="truncate text-base font-semibold text-white">
            <Name>{guest.name}</Name>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs">
            {guest.opened ? (
              <span className="text-emerald-300">נפתח ✅</span>
            ) : (
              <span className="text-white/40">טרם נפתח</span>
            )}
            {guest.opened && guest.payment_method && (
              <span className="text-white/45">
                {paymentMethodEmoji(guest.payment_method)} {paymentMethodLabel(guest.payment_method)}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {guest.opened && typeof guest.amount === "number" && (
            <span className="num text-gold-gradient text-base font-bold">{formatILS(guest.amount)}</span>
          )}
          {selected && <span className="chip bg-gold-500/20 text-gold-200">על המסך</span>}
        </div>
      </button>

      {/* delete */}
      {confirming ? (
        <div className="flex items-center gap-1 pe-2 ps-1">
          <button
            type="button"
            onClick={() => {
              onDelete(guest.id);
              setConfirming(false);
            }}
            className="rounded-lg bg-red-500/20 px-2.5 py-1.5 text-xs font-bold text-red-200 hover:bg-red-500/30"
          >
            מחק
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-lg px-2 py-1.5 text-xs text-white/60 hover:bg-white/10"
          >
            ביטול
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label={`מחיקת ${guest.name}`}
          className="px-3 text-white/25 transition hover:text-red-300"
        >
          🗑️
        </button>
      )}
    </div>
  );
}
