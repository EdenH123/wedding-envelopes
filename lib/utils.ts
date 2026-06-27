import type { EventStats, Guest, PaymentMethod } from "./types";

/** The three payment methods, with Hebrew labels and an icon for the UI. */
export const PAYMENT_METHODS: { value: PaymentMethod; label: string; emoji: string }[] = [
  { value: "bit", label: "ביט", emoji: "📱" },
  { value: "cash", label: "מזומן", emoji: "💵" },
  { value: "check", label: "צ׳ק", emoji: "🧾" },
];

/** Hebrew label for a payment method (empty string if none). */
export function paymentMethodLabel(method: PaymentMethod | null | undefined): string {
  return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? "";
}

/** Emoji for a payment method (empty string if none). */
export function paymentMethodEmoji(method: PaymentMethod | null | undefined): string {
  return PAYMENT_METHODS.find((m) => m.value === method)?.emoji ?? "";
}

/** Tiny classnames helper (no dependency needed). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * Format a number as Israeli New Shekel, symbol-first to match the display spec
 * ("₪1,500"). Whole numbers show no decimals; fractional amounts show up to 2.
 */
export function formatILS(
  amount: number | null | undefined,
  opts: { withSymbol?: boolean } = {}
): string {
  const { withSymbol = true } = opts;
  const value = typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
  const hasFraction = Math.round(value) !== value;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  }).format(value);
  return withSymbol ? `₪${formatted}` : formatted;
}

/** Compact grouped integer, e.g. 12345 -> "12,345". */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

/**
 * The visual tier used to pick the reveal animation.
 * Order matters: the "lucky17" easter egg (exactly ₪1717) wins over everything.
 */
export type AmountTier =
  | "sparkle" // < 500
  | "confetti-small" // 500–999
  | "confetti-big" // 1000–1499
  | "fireworks" // 1500–1999
  | "royal" // 2000+
  | "lucky17"; // exactly 1717

export function getAmountTier(amount: number | null | undefined): AmountTier {
  const value = typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
  if (value === 1717) return "lucky17";
  if (value >= 2000) return "royal";
  if (value >= 1500) return "fireworks";
  if (value >= 1000) return "confetti-big";
  if (value >= 500) return "confetti-small";
  return "sparkle";
}

/** Human label for a tier (used for the small caption under the amount). */
export function tierLabel(tier: AmountTier): string {
  switch (tier) {
    case "lucky17":
      return "🎰 מזל 17! 🎰";
    case "royal":
      return "👑 נדיבות מלכותית 👑";
    case "fireworks":
      return "🎆 מרהיב! 🎆";
    case "confetti-big":
      return "🎉 מדהים! 🎉";
    case "confetti-small":
      return "🎊 נהדר! 🎊";
    case "sparkle":
    default:
      return "✨ תודה רבה! ✨";
  }
}

/** Compute the live statistics shown on the display from the guest list. */
export function computeStats(guests: Guest[]): EventStats {
  const opened = guests.filter((g) => g.opened && typeof g.amount === "number");
  const totalAmount = opened.reduce((sum, g) => sum + (g.amount ?? 0), 0);
  const king = opened.reduce<Guest | null>((best, g) => {
    if (!best) return g;
    return (g.amount ?? 0) > (best.amount ?? 0) ? g : best;
  }, null);

  return {
    totalGuests: guests.length,
    openedCount: opened.length,
    totalAmount,
    averageAmount: opened.length > 0 ? totalAmount / opened.length : 0,
    king,
  };
}

export interface MethodTotal {
  sum: number;
  count: number;
}

export interface PaymentBreakdown {
  bit: MethodTotal;
  cash: MethodTotal;
  check: MethodTotal;
  /** Opened envelopes that have no payment method recorded (legacy data). */
  unspecified: MethodTotal;
}

/** Sum + count of opened envelopes grouped by payment method. */
export function computePaymentBreakdown(guests: Guest[]): PaymentBreakdown {
  const empty = (): MethodTotal => ({ sum: 0, count: 0 });
  const out: PaymentBreakdown = {
    bit: empty(),
    cash: empty(),
    check: empty(),
    unspecified: empty(),
  };
  for (const g of guests) {
    if (!g.opened || typeof g.amount !== "number") continue;
    const bucket =
      g.payment_method === "bit"
        ? out.bit
        : g.payment_method === "cash"
          ? out.cash
          : g.payment_method === "check"
            ? out.check
            : out.unspecified;
    bucket.sum += g.amount;
    bucket.count += 1;
  }
  return out;
}

/** Opened envelopes sorted by amount (highest first), limited to `limit`. */
export function topGivers(guests: Guest[], limit = 10): Guest[] {
  return guests
    .filter((g) => g.opened && typeof g.amount === "number")
    .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))
    .slice(0, limit);
}

/** Normalize a name for duplicate detection (trim + collapse inner whitespace). */
export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

/** Case/whitespace-insensitive key for dedupe maps. */
export function nameKey(name: string): string {
  return normalizeName(name).toLocaleLowerCase();
}

/**
 * Detect whether a string contains Hebrew (or other RTL) characters, so name
 * fields can be given the correct base direction.
 */
export function isRTLText(text: string): boolean {
  return /[֐-׿؀-ۿ܀-ݏ]/.test(text);
}
