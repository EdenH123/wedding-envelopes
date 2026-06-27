"use client";

import { useMemo, useState } from "react";
import type { Guest } from "@/lib/types";
import { nameKey } from "@/lib/utils";
import { GuestCard } from "./GuestCard";

const MAX_VISIBLE = 60;

export function GuestSearch({
  guests,
  selectedId,
  onSelect,
  onDelete,
}: {
  guests: Guest[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = nameKey(query);
    if (!q) return guests;
    return guests.filter((g) => nameKey(g.name).includes(q));
  }, [guests, query]);

  const visible = filtered.slice(0, MAX_VISIBLE);
  const hidden = filtered.length - visible.length;

  return (
    <section className="card-glass flex min-h-0 flex-1 flex-col p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-white">🔍 מוזמנים</h2>
        <span className="text-xs text-white/45">
          סה״כ <span className="num">{guests.length}</span>
        </span>
      </div>

      <div className="relative mt-3">
        <input
          className="input pe-9"
          placeholder="חיפוש לפי שם…"
          dir="auto"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pe-1">
        {visible.length === 0 ? (
          <div className="py-10 text-center text-sm text-white/40">
            {guests.length === 0
              ? "אין עדיין מוזמנים — ייבאו קובץ אקסל או הוסיפו ידנית."
              : "לא נמצאו תוצאות."}
          </div>
        ) : (
          visible.map((g) => (
            <GuestCard
              key={g.id}
              guest={g}
              selected={g.id === selectedId}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))
        )}

        {hidden > 0 && (
          <p className="py-2 text-center text-xs text-white/40">
            ועוד <span className="num">{hidden}</span> — המשיכו להקליד לצמצום החיפוש.
          </p>
        )}
      </div>
    </section>
  );
}
