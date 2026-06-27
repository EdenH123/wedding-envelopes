"use client";

import type { AmountTier } from "./utils";

/**
 * Web Audio sound effects — no files. Celebrations are built on realistic
 * APPLAUSE: each clap is a transient "snap" + a warm body, panned across the
 * stereo field, fed through a convolution reverb so a burst of them sounds like
 * a real crowd in a hall (not thin clicks). A master low-pass keeps everything
 * easy on the ears.
 *
 * Browsers block audio until a user gesture, so call `unlockAudio()` from a
 * click handler once (the display's sound toggle does this).
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null; // volume / mute; everything connects here
let muted = false;

const BASE_VOLUME = 0.85;

function makeReverbIR(seconds: number, decay: number): AudioBuffer {
  const c = ctx!;
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  return buf;
}

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const AC: typeof AudioContext | undefined =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();

  master = ctx.createGain();
  master.gain.value = muted ? 0 : BASE_VOLUME;

  // Tame piercing highs so nothing hurts the ears.
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 5000;
  lowpass.Q.value = 0.6;

  // Gentle limiter so dense applause never clips harshly.
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 4;

  // Dry path.
  master.connect(lowpass);
  lowpass.connect(comp);
  comp.connect(ctx.destination);

  // Wet (reverb) path — gives applause a natural room/hall ambience.
  const reverb = ctx.createConvolver();
  reverb.buffer = makeReverbIR(1.8, 2.6);
  const wet = ctx.createGain();
  wet.gain.value = 0.3;
  master.connect(reverb);
  reverb.connect(wet);
  wet.connect(comp);

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
  const { type = "triangle", peak = 0.25, attack = 0.012, detune = 0 } = opts;
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
  opts: {
    peak?: number;
    type?: BiquadFilterType;
    freq?: number;
    q?: number;
    attack?: number;
    pan?: number;
  } = {}
): void {
  const c = ensure()!;
  const { peak = 0.3, type = "bandpass", freq = 1200, q = 1, attack = 0.001, pan = 0 } = opts;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(dur + 0.05);
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const g = envGain(start, attack, dur, peak);
  src.connect(filter);
  if (pan !== 0 && c.createStereoPanner) {
    const panner = c.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    filter.connect(panner);
    panner.connect(g);
  } else {
    filter.connect(g);
  }
  src.start(start);
  src.stop(start + dur + 0.05);
}

// ── Applause ─────────────────────────────────────────────────────────

/** A single realistic hand-clap: a quick transient snap + a warm body. */
function clap(start: number, peak = 0.5): void {
  const pan = Math.random() * 1.3 - 0.65;
  // warm body
  noise(start, 0.055, { peak: peak * 0.9, type: "bandpass", freq: 750 + Math.random() * 450, q: 0.55, attack: 0.0008, pan });
  // transient snap (kept subtle; master low-pass tames it)
  noise(start + 0.001, 0.02, { peak: peak * 0.5, type: "bandpass", freq: 2400, q: 0.6, attack: 0.0004, pan });
}

/**
 * A burst of randomized, panned claps = applause. With the reverb tail this
 * reads as a real crowd. Higher density/peak = bigger ovation.
 */
function applause(start: number, duration = 2.2, density = 30, peak = 0.32): void {
  const total = Math.floor(duration * density);
  for (let i = 0; i < total; i++) {
    // ease the crowd in slightly at the start
    const t = start + Math.random() * duration;
    clap(t, peak * (0.45 + Math.random() * 0.7));
  }
}

// ── Other (warm, mid-range) instruments ──────────────────────────────

function brass(freq: number, start: number, dur: number, peak = 0.22): void {
  const c = ensure()!;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = Math.max(900, freq * 3);
  filter.Q.value = 0.8;
  filter.connect(envGain(start, 0.04, dur, peak));
  for (const detune of [-6, 6]) {
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = freq;
    o.detune.value = detune;
    o.connect(filter);
    o.start(start);
    o.stop(start + dur + 0.03);
  }
}

/** A soft, warm fanfare accent (gentle — not the star of the show). */
function fanfareAccent(start: number, peak = 0.2): void {
  const C5 = 523.25, E5 = 659.25, G5 = 783.99;
  const q = 0.16;
  brass(C5, start, q * 0.9, peak);
  brass(E5, start + q, q * 0.9, peak);
  brass(G5, start + 2 * q, q * 2.2, peak);
  brass(E5, start + 2 * q, q * 2.2, peak * 0.5);
}

/** Soft, warm coin clinks (triangle, mid pitch). */
function coins(start: number, count = 8, peak = 0.16): void {
  for (let i = 0; i < count; i++) {
    const t = start + i * 0.085 + Math.random() * 0.04;
    tone(659.25, t, 0.09, { type: "triangle", peak: peak * (0.7 + Math.random() * 0.4) });
    tone(880, t + 0.05, 0.15, { type: "triangle", peak: peak * 0.8 });
  }
}

/** A single firework: soft whoosh → low boom → muted crackle. */
function firework(start: number): void {
  const c = ensure()!;
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(500, start);
  o.frequency.exponentialRampToValueAtTime(1100, start + 0.4);
  o.connect(envGain(start, 0.02, 0.4, 0.1));
  o.start(start);
  o.stop(start + 0.44);
  noise(start + 0.42, 0.45, { peak: 0.42, type: "lowpass", freq: 190, q: 0.7, attack: 0.002 }); // boom
  for (let i = 0; i < 6; i++) {
    noise(start + 0.45 + Math.random() * 0.6, 0.05, { peak: 0.08, type: "bandpass", freq: 1800, q: 0.6 });
  }
}

// ── Public API (applause-forward) ────────────────────────────────────

export function playForTier(tier: AmountTier): void {
  if (!isReady()) return;
  const t = nowT() + 0.02;
  switch (tier) {
    case "sparkle":
      applause(t, 1.2, 20, 0.3);
      break;
    case "confetti-small":
      applause(t, 1.7, 28, 0.34);
      break;
    case "confetti-big":
      applause(t, 2.3, 42, 0.4);
      break;
    case "fireworks":
      firework(t);
      firework(t + 0.6);
      applause(t + 0.25, 2.6, 40, 0.38);
      break;
    case "royal":
      // Standing ovation: huge warm crowd + a soft fanfare accent + a few coins.
      applause(t, 3.6, 90, 0.46);
      fanfareAccent(t + 0.15, 0.2);
      coins(t + 0.4, 5, 0.13);
      break;
    case "lucky17":
      // Casino: applause + soft coins.
      applause(t, 2.2, 38, 0.38);
      coins(t, 10, 0.18);
      break;
  }
}

export function playFinale(): void {
  if (!isReady()) return;
  const t = nowT() + 0.02;
  applause(t, 4.5, 80, 0.46);
  fanfareAccent(t + 0.15, 0.2);
  coins(t + 0.5, 12, 0.14);
}

/** An accelerating, soft drumroll for the "Ready?" tension build. */
export function playDrumroll(durationMs = 1500): void {
  if (!isReady()) return;
  const start = nowT() + 0.02;
  const end = start + durationMs / 1000;
  let t = start;
  let gap = 0.09;
  while (t < end) {
    noise(t, 0.045, { peak: 0.15, type: "bandpass", freq: 1300, q: 0.7, attack: 0.001 });
    gap = Math.max(0.028, gap * 0.93);
    t += gap;
  }
  noise(end, 0.16, { peak: 0.32, type: "bandpass", freq: 1100, q: 0.6 });
}

/** A short applause preview when the operator enables audio. */
export function playTestChime(): void {
  if (!isReady()) return;
  applause(nowT() + 0.02, 0.8, 30, 0.34);
}
