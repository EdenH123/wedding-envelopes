import { cn } from "@/lib/utils";

// 18 pockets, with 17 placed at the very top (index 0). The list alternates the
// real roulette red/black colours, and the wheel spins a whole number of turns
// (1440°) so it always comes to rest with 17 back under the fixed pointer.
const NUMBERS = [17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14];
const SEG = 360 / NUMBERS.length; // 20°
const R_OUT = 150;
const R_IN = 92;
const R_TEXT = (R_OUT + R_IN) / 2;
const CENTER = 200;

// Real roulette red numbers.
const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

function pt(angleDeg: number, r: number): [number, number] {
  const a = ((angleDeg - 90) * Math.PI) / 180; // -90 → 12 o'clock
  return [CENTER + r * Math.cos(a), CENTER + r * Math.sin(a)];
}

function wedgePath(i: number): string {
  const a0 = i * SEG - SEG / 2;
  const a1 = i * SEG + SEG / 2;
  const [ox0, oy0] = pt(a0, R_OUT);
  const [ox1, oy1] = pt(a1, R_OUT);
  const [ix1, iy1] = pt(a1, R_IN);
  const [ix0, iy0] = pt(a0, R_IN);
  return `M ${ox0} ${oy0} A ${R_OUT} ${R_OUT} 0 0 1 ${ox1} ${oy1} L ${ix1} ${iy1} A ${R_IN} ${R_IN} 0 0 0 ${ix0} ${iy0} Z`;
}

/**
 * A stylised roulette wheel that spins and lands on 17 — the casino reveal for
 * the ₪1,717 "Lucky 17" tier. Pure CSS animation, no client JS.
 */
export function RouletteWheel({ className }: { className?: string }) {
  return (
    <div className={cn("relative aspect-square", className)}>
      <svg
        viewBox="0 0 400 400"
        className="h-full w-full animate-roulette-spin drop-shadow-[0_0_40px_rgba(220,38,38,0.45)]"
        role="img"
        aria-label="גלגל רולטה שעוצר על 17"
      >
        {/* outer gold rim */}
        <circle cx={CENTER} cy={CENTER} r={158} fill="#1a1208" stroke="#d4af37" strokeWidth={6} />
        <circle cx={CENTER} cy={CENTER} r={150} fill="none" stroke="#8a6d1f" strokeWidth={2} />

        {/* pockets */}
        {NUMBERS.map((n, i) => {
          const isWinner = n === 17;
          const fill = isWinner ? "#d4af37" : RED.has(n) ? "#c81e1e" : "#161616";
          return (
            <path
              key={n}
              d={wedgePath(i)}
              fill={fill}
              stroke="#d4af37"
              strokeWidth={isWinner ? 2.5 : 1}
            />
          );
        })}

        {/* numbers */}
        {NUMBERS.map((n, i) => {
          const ci = i * SEG;
          const [x, y] = pt(ci, R_TEXT);
          const isWinner = n === 17;
          return (
            <text
              key={`t-${n}`}
              x={x}
              y={y}
              transform={`rotate(${ci} ${x} ${y})`}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isWinner ? 26 : 17}
              fontWeight={isWinner ? 900 : 700}
              fill={isWinner ? "#1a1208" : "#ffffff"}
              fontFamily="Heebo, sans-serif"
            >
              {n}
            </text>
          );
        })}

        {/* hub with spokes */}
        <circle cx={CENTER} cy={CENTER} r={R_IN} fill="#0f0a04" stroke="#d4af37" strokeWidth={3} />
        {[0, 45, 90, 135].map((deg) => {
          const [x1, y1] = pt(deg, R_IN);
          const [x2, y2] = pt(deg + 180, R_IN);
          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6b5418" strokeWidth={4} />;
        })}
        <circle cx={CENTER} cy={CENTER} r={26} fill="#d4af37" />
        <circle cx={CENTER} cy={CENTER} r={14} fill="#0f0a04" />

        {/* the ball, resting in the 17 pocket (top) */}
        <circle cx={CENTER} cy={CENTER - R_TEXT} r={9} fill="#ffffff" stroke="#cbcbcb" strokeWidth={1} />
        <circle cx={CENTER - 2.5} cy={CENTER - R_TEXT - 2.5} r={2.6} fill="#ffffff" opacity={0.9} />
      </svg>

      {/* fixed pointer at the top (does not spin) */}
      <div className="absolute start-1/2 top-[-0.4vh] h-0 w-0 -translate-x-1/2 border-x-[1.3vh] border-t-[2.2vh] border-x-transparent border-t-gold-400 drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]" />
    </div>
  );
}
