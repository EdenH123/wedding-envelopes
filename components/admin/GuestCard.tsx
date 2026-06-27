"use client";

import type { Guest } from "@/lib/types";
import { cn, formatILS, paymentMethodEmoji, paymentMethodLabel } from "@/lib/utils";
import { Name } from "@/components/Name";

export function GuestCard({
  guest,
  selected,
  onSelect,
}: {
  guest: Guest;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(guest.id)}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-start transition active:scale-[0.99]",
        selected
          ? "border-gold-500/70 bg-gold-500/15 shadow-glow-sm"
          : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
      )}
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
        {selected && (
          <span className="chip bg-gold-500/20 text-gold-200">על המסך</span>
        )}
        <span className="text-white/30" aria-hidden>
          ‹
        </span>
      </div>
    </button>
  );
}
