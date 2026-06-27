/**
 * A brief intro that plays at the start of a reveal: a gold envelope whose flap
 * tears open, then the whole thing fades up and out — handing off to the amount.
 * Pure CSS; mounts fresh per reveal (parent keys it).
 */
export function EnvelopeOpenFx() {
  return (
    <div className="animate-fade-out-up pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <div className="relative" style={{ width: "34vh", height: "22vh" }}>
        {/* glow */}
        <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gold-500/40 blur-3xl" />

        {/* body */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#fdf6e3] to-[#e9d3a0] shadow-card" />
        {/* inner pocket lines */}
        <div
          className="absolute inset-0 rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, transparent 49.4%, rgba(217,192,138,0.7) 49.7%, transparent 50%), linear-gradient(225deg, transparent 49.4%, rgba(217,192,138,0.7) 49.7%, transparent 50%)",
          }}
        />

        {/* wax seal */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[5vh]" aria-hidden>
          💛
        </div>

        {/* opening flap */}
        <div
          className="animate-flap-open absolute left-0 top-0 origin-top"
          style={{
            width: 0,
            height: 0,
            borderLeft: "17vh solid transparent",
            borderRight: "17vh solid transparent",
            borderTop: "11vh solid #f0dcae",
          }}
        />
      </div>
    </div>
  );
}
