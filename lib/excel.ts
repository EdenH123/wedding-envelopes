import * as XLSX from "xlsx";
import type { Guest } from "./types";
import { normalizeName } from "./utils";

/**
 * Parse an uploaded spreadsheet and return guest names from the FIRST column.
 * - Reads the first sheet only.
 * - Skips a likely header cell (e.g. "name" / "שם" / "שם מלא").
 * - Skips empty rows and de-duplicates within the file (case/space-insensitive).
 */
export async function parseGuestNamesFromFile(file: File): Promise<string[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: "",
  });

  const names: string[] = [];
  const seen = new Set<string>();

  rows.forEach((row, index) => {
    const first = Array.isArray(row) ? row[0] : undefined;
    const name = normalizeName(String(first ?? ""));
    if (!name) return;

    // Heuristic: drop an obvious header row in the first position.
    if (index === 0 && isLikelyHeader(name)) return;

    const key = name.toLocaleLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    names.push(name);
  });

  return names;
}

const HEADER_WORDS = new Set([
  "name",
  "names",
  "guest",
  "guests",
  "full name",
  "שם",
  "שמות",
  "שם מלא",
  "מוזמן",
  "מוזמנים",
  "שם המוזמן",
]);

function isLikelyHeader(value: string): boolean {
  return HEADER_WORDS.has(value.toLocaleLowerCase());
}

/**
 * Export all guests to an .xlsx file and trigger a browser download.
 * Columns: name, amount, opened, created_at, updated_at.
 */
export function exportGuestsToExcel(guests: Guest[], fileName = "envelope-show-results.xlsx") {
  const rows = guests.map((g) => ({
    name: g.name,
    amount: g.amount ?? "",
    opened: g.opened ? "yes" : "no",
    created_at: g.created_at,
    updated_at: g.updated_at,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: ["name", "amount", "opened", "created_at", "updated_at"],
  });

  // Reasonable column widths.
  worksheet["!cols"] = [
    { wch: 28 },
    { wch: 12 },
    { wch: 8 },
    { wch: 24 },
    { wch: 24 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Guests");
  XLSX.writeFile(workbook, fileName);
}
