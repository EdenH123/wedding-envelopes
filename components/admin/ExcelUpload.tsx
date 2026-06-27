"use client";

import { useRef, useState } from "react";
import { parseGuestNamesFromFile } from "@/lib/excel";
import type { ImportResult } from "@/lib/useEventShow";

export function ExcelUpload({
  onImport,
}: {
  onImport: (names: string[]) => Promise<ImportResult>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    setMessage(null);
    setIsError(false);
    try {
      const names = await parseGuestNamesFromFile(file);
      if (names.length === 0) {
        setIsError(true);
        setMessage("לא נמצאו שמות בעמודה הראשונה.");
        return;
      }
      const result = await onImport(names);
      if (!result.ok) {
        setIsError(true);
        setMessage(result.error ?? "הייבוא נכשל.");
        return;
      }
      const parts = [`✅ יובאו ${result.imported} מוזמנים`];
      if (result.skipped > 0) parts.push(`(${result.skipped} כפילויות דולגו)`);
      setMessage(parts.join(" "));
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "לא ניתן לקרוא את הקובץ.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <section className="card-glass p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white">📥 ייבוא מוזמנים</h2>
          <p className="text-xs text-white/50">העלו קובץ אקסל — שמות מהעמודה הראשונה.</p>
        </div>
        <button
          type="button"
          className="btn-outline shrink-0 text-sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "מייבא…" : "בחירת קובץ"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
      </div>

      {message && (
        <p className={`mt-3 text-sm ${isError ? "text-red-300" : "text-emerald-300"}`}>{message}</p>
      )}
    </section>
  );
}
