"use client";

import type { AmountTier } from "./utils";

/**
 * All sound effects are synthesized with the Web Audio API — no audio files to
 * host or license. Each amount tier gets a fitting sound; the biggest tiers get
 * loud applause + a trumpet fanfare, and the casino "Lucky 17" gets coins.
 *
 * Browsers block audio until a user gesture, so call `unlockAudio()` from a
 * click handler once (the display's sound toggle does this).
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

const BASE_VOLUME = 0.9;

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const AC: typeof AudioContext | undefined =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : BASE_VOLUME;
  // A gentle limiter keeps dense applause from clipping harshly.
  const comp = ctx.createDynamicsCompressor();
  master.connect(comp);
  comp.connect(ctx.destination);
  return ctx;
}

export async function unlockAudio(): Promise<void> {
  const c = ensure();
  if (!c) return;
  if (c.state === "suspended") {
    try {
      await c.resume();
    } catch {
      /* ignore */
    }
  }
}

export function isReady(): boolean {
  return !!ctx && ctx.state === "running";
}

export function setMuted(m: boolean): void {
  muted = m;
  if (master) master.gain.value = m ? 0 : BASE_VOLUME;
  try {
    localStorage.setItem("envshow-muted", m ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function getMutedPref(): boolean {
  try {
    return localStorage.getItem("envshow-muted") === "1";
  } catch {
    return false;
  }
}

// ── Synthesis primitives ─────────────────────────────────────────────

function nowT(): number {
  return ensure()!.currentTime;
}

function envGain(start: number, attack: number, dur: number, peak: number): GainNode {
  const c = ensure()!;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), start + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  g.connect(master!);
  return g;
}

function tone(
  freq: number,
  start: number,
  dur: number,
  opts: { type?: OscillatorType; peak?: number; attack?: number; detune?: number } = {}
): void {
  const c = ensure()!;
  const { type = "sine", peak = 0.3, attack = 0.005, detune = 0 } = opts;
  const o = c.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  o.detune.value = detune;
  o.connect(envGain(start, attack, dur, peak));
  o.start(start);
  o.stop(start + dur + 0.03);
}

function noiseBuffer(dur: number): AudioBuffer {
  const c = ensure()!;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function noise(
  start: number,
  dur: number,
  opts: { peak?: number; type?: BiquadFilterType; freq?: number; q?: number; attack?: number } = {}
): void {
  const c = ensure()!;
  const { peak = 0.3, type = "bandpass", freq = 1500, q = 1, attack = 0.001 } = opts;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(dur + 0.05);
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  src.connect(filter);
  filter.connect(envGain(start, attack, dur, peak));
  src.start(start);
  src.stop(start + dur + 0.05);
}

// ── Instruments ──────────────────────────────────────────────────────

function clap(start: number, peak = 0.5): void {
  noise(start, 0.05, { peak, type: "bandpass", freq: 1100 + Math.random() * 900, q: 0.7, attack: 0.001 });
}

/** A burst of randomized claps = applause. Higher density/peak = louder crowd. */
function applause(start: number, duration = 2.2, density = 30, peak = 0.32): void {
  const total = Math.floor(duration * density);
  for (let i = 0; i < total; i++) {
    const t = start + Math.random() * duration;
    clap(t, peak * (0.45 + Math.random() * 0.7));
  }
}

/** A brassy note (layered detuned saws through a lowpass). */
function brass(freq: number, start: number, dur: number, peak = 0.26): void {
  const c = ensure()!;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = Math.max(1400, freq * 4);
  filter.Q.value = 1;
  filter.connect(envGain(start, 0.03, dur, peak));
  for (const detune of [-7, 7]) {
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = freq;
    o.detune.value = detune;
    o.connect(filter);
    o.start(start);
    o.stop(start + dur + 0.03);
  }
}

/** A triumphant trumpet fanfare ending on a held major chord. */
function trumpetFanfare(start: number, peak = 0.3): void {
  const G4 = 392, C5 = 523.25, E5 = 659.25, G5 = 783.99;
  const q = 0.16;
  brass(G4, start, q * 0.9, peak);
  brass(C5, start + q, q * 0.9, peak);
  brass(E5, start + 2 * q, q * 0.9, peak);
  // held triumphant chord
  brass(G5, start + 3 * q, q * 2.4, peak * 1.1);
  brass(E5, start + 3 * q, q * 2.4, peak * 0.6);
  brass(C5, start + 3 * q, q * 2.4, peak * 0.6);
}

/** A satisfying two-note coin "cling" (à la classic arcade). */
function coin(start: number, peak = 0.3): void {
  tone(988, start, 0.07, { type: "square", peak });
  tone(1319, start + 0.06, 0.22, { type: "square", peak });
}

/** A cascade of coins dropping. */
function coins(start: number, count = 12, peak = 0.24): void {
  for (let i = 0; i < count; i++) {
    const t = start + i * 0.075 + Math.random() * 0.04;
    coin(t, peak * (0.7 + Math.random() * 0.5));
  }
}

/** Gentle ascending wind-chime sparkle. */
function sparkle(start: number, peak = 0.24): void {
  [1318.5, 1568, 2093, 2637].forEach((f, i) =>
    tone(f, start + i * 0.07, 0.45, { type: "sine", peak: peak * (1 - i * 0.12) })
  );
}

/** A bright casino win arpeggio. */
function winJingle(start: number, peak = 0.26): void {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
    tone(f, start + i * 0.1, 0.32, { type: "square", peak })
  );
}

/** A single firework: rising whistle → boom → crackle. */
function firework(start: number): void {
  const c = ensure()!;
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(700, start);
  o.frequency.exponentialRampToValueAtTime(1900, start + 0.4);
  o.connect(envGain(start, 0.01, 0.4, 0.16));
  o.start(start);
  o.stop(start + 0.44);
  noise(start + 0.42, 0.4, { peak: 0.5, type: "lowpass", freq: 220, q: 0.7, attack: 0.002 });
  for (let i = 0; i < 12; i++) {
    noise(start + 0.45 + Math.random() * 0.6, 0.04, { peak: 0.18, type: "highpass", freq: 4500, q: 0.5 });
  }
}

// ── Public API ───────────────────────────────────────────────────────

/** Play the sound that matches a reveal's amount tier. */
export function playForTier(tier: AmountTier): void {
  if (!isReady()) return;
  const t = nowT() + 0.02;
  switch (tier) {
    case "sparkle":
      sparkle(t, 0.22);
      break;
    case "confetti-small":
      sparkle(t, 0.15);
      applause(t, 1.3, 18, 0.3);
      break;
    case "confetti-big":
      applause(t, 2, 32, 0.34);
      sparkle(t + 0.1, 0.16);
      break;
    case "fireworks":
      firework(t);
      firework(t + 0.6);
      firework(t + 1.2);
      applause(t + 0.3, 2, 26, 0.3);
      break;
    case "royal":
      // The most valuable tier: loud trumpets + a roaring crowd + coins.
      trumpetFanfare(t, 0.34);
      applause(t + 0.1, 3.2, 70, 0.42);
      coins(t + 0.25, 8, 0.18);
      break;
    case "lucky17":
      // Casino: a shower of coins + a win jingle.
      coins(t, 16, 0.28);
      winJingle(t + 0.05, 0.26);
      break;
  }
}

/** Big celebratory sound for the summary finale screen. */
export function playFinale(): void {
  if (!isReady()) return;
  const t = nowT() + 0.02;
  trumpetFanfare(t, 0.34);
  applause(t + 0.2, 4, 60, 0.42);
  coins(t + 0.5, 22, 0.2);
}

/** An accelerating snare drumroll for the "Ready?" tension build, ending on a hit. */
export function playDrumroll(durationMs = 1500): void {
  if (!isReady()) return;
  const start = nowT() + 0.02;
  const end = start + durationMs / 1000;
  let t = start;
  let gap = 0.09;
  while (t < end) {
    noise(t, 0.04, { peak: 0.2, type: "bandpass", freq: 2200, q: 0.8, attack: 0.001 });
    gap = Math.max(0.028, gap * 0.93); // speed up
    t += gap;
  }
  noise(end, 0.14, { peak: 0.42, type: "bandpass", freq: 1700, q: 0.6 }); // final accent
}

/** A short confirmation sound when the operator enables audio. */
export function playTestChime(): void {
  if (!isReady()) return;
  sparkle(nowT() + 0.02, 0.22);
}
