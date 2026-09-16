// Background music, synthesized live with the Web Audio API: "Pulso nocturno", a quiet four-bar loop in E minor —
// a synth bass walking in eighths, an airy chord above it, a hi-hat you barely notice and a plucked string every
// four bars. Nothing is copied from an existing song and there is no audio file to download or license.
// Browsers only allow sound after the visitor interacts with the page, so it starts on the first click, tap or key,
// unless it was turned off on an earlier visit.

const STORAGE_KEY = "portfolio-music";
// The level chosen while comparing the three demo loops: 20 out of 100 on that page's slider.
const VOLUME = 0.16;
const BPM = 100;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
// One chord per bar, as MIDI numbers: `voice` is the airy chord on top, `arp` the bass figure underneath.
const CHORDS = [
  { voice: [71, 76, 79], arp: [40, 47, 52, 47] }, // Em
  { voice: [72, 76, 79], arp: [36, 43, 48, 43] }, // Cmaj7
  { voice: [71, 74, 79], arp: [43, 50, 55, 50] }, // G
  { voice: [69, 74, 78], arp: [38, 45, 50, 45] }, // D
];

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

type Listener = () => void;
const listeners = new Set<Listener>();
let playing = false;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let bus: GainNode | null = null;
let hiss: AudioBuffer | null = null;
let scheduler: ReturnType<typeof setInterval> | undefined;
let nextBar = 0;
let bar = 0;

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

export const isPlaying = () => playing;

function setPlaying(value: boolean) {
  playing = value;
  try {
    localStorage.setItem(STORAGE_KEY, value ? "on" : "off");
  } catch {}
  listeners.forEach((l) => l());
}

function wanted() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

/** Stereo noise: fading away it makes a cheap, soft room reverb; flat (decay 0) it is the hi-hat. */
function noiseBuffer(audio: AudioContext, seconds: number, decay: number) {
  const length = Math.floor(audio.sampleRate * seconds);
  const buffer = audio.createBuffer(2, length, audio.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (decay ? Math.pow(1 - i / length, decay) : 1);
  }
  return buffer;
}

function build() {
  const audio = new AudioContext();
  const out = audio.createGain();
  out.gain.value = 0;
  const limiter = audio.createDynamicsCompressor();
  limiter.threshold.value = -14;
  limiter.ratio.value = 4;
  out.connect(limiter).connect(audio.destination);

  const reverb = audio.createConvolver();
  reverb.buffer = noiseBuffer(audio, 2.4, 2.6);
  const wet = audio.createGain();
  wet.gain.value = 0.7;
  reverb.connect(wet).connect(out);

  // every voice goes through one bus, which is also what feeds the reverb
  const voices = audio.createGain();
  voices.connect(out);
  const send = audio.createGain();
  send.gain.value = 0.3;
  voices.connect(send).connect(reverb);

  document.addEventListener("visibilitychange", () => {
    if (!playing) return;
    if (document.hidden) void audio.suspend();
    else void audio.resume();
  });

  ctx = audio;
  master = out;
  bus = voices;
  hiss = noiseBuffer(audio, 1.5, 0);
}

/** The chord on top: two detuned saws per note, under a filter that opens and closes across the bar. */
function pad(t: number, midis: number[], seconds: number, gain: number) {
  const audio = ctx!;
  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(700, t);
  filter.frequency.linearRampToValueAtTime(1500, t + seconds * 0.5);
  filter.frequency.linearRampToValueAtTime(800, t + seconds);
  const env = audio.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(gain, t + seconds * 0.35);
  env.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  filter.connect(env).connect(bus!);
  for (const midi of midis) {
    for (const cents of [-5, 5]) {
      const osc = audio.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = hz(midi);
      osc.detune.value = cents;
      osc.connect(filter);
      osc.start(t);
      osc.stop(t + seconds + 0.1);
    }
  }
}

/** One step of the bass figure: a saw whose filter closes as the note decays. */
function bass(t: number, midi: number, seconds: number, gain: number) {
  const audio = ctx!;
  const osc = audio.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = hz(midi);
  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(900, t);
  filter.frequency.exponentialRampToValueAtTime(260, t + seconds);
  const env = audio.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(gain, t + 0.02);
  env.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  osc.connect(filter).connect(env).connect(bus!);
  osc.start(t);
  osc.stop(t + seconds + 0.05);
}

function hat(t: number, gain: number) {
  const audio = ctx!;
  const src = audio.createBufferSource();
  src.buffer = hiss;
  src.loop = true;
  const filter = audio.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 7800;
  filter.Q.value = 1.2;
  const env = audio.createGain();
  env.gain.setValueAtTime(gain, t);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
  src.connect(filter).connect(env).connect(bus!);
  src.start(t, Math.random());
  src.stop(t + 0.07);
}

/**
 * Karplus-Strong: a softened noise burst chased around a ring buffer one wavelength long, averaging as it goes,
 * turns into a plucked nylon string. Rendered once per note and kept, because it is the same pluck every time.
 */
const plucks = new Map<number, AudioBuffer>();
function pluckBuffer(freq: number) {
  const audio = ctx!;
  const key = Math.round(freq * 4);
  const cached = plucks.get(key);
  if (cached) return cached;
  const size = Math.max(2, Math.round(audio.sampleRate / freq));
  const buffer = audio.createBuffer(1, Math.floor(audio.sampleRate * 2.1), audio.sampleRate);
  const out = buffer.getChannelData(0);
  const ring = new Float32Array(size);
  let smooth = 0;
  for (let i = 0; i < size; i++) {
    smooth = 0.6 * smooth + 0.4 * (Math.random() * 2 - 1); // a softened burst is nylon, not steel
    ring[i] = smooth;
  }
  let previous = 0;
  let index = 0;
  for (let i = 0; i < out.length; i++) {
    const current = ring[index];
    out[i] = current;
    ring[index] = 0.9965 * 0.5 * (current + previous);
    previous = current;
    index = (index + 1) % size;
  }
  plucks.set(key, buffer);
  return buffer;
}

function pluck(t: number, midi: number, gain: number) {
  const audio = ctx!;
  const src = audio.createBufferSource();
  src.buffer = pluckBuffer(hz(midi));
  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 4200;
  const env = audio.createGain();
  env.gain.setValueAtTime(gain, t);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 1.9);
  src.connect(filter).connect(env).connect(bus!);
  src.start(t);
  src.stop(t + 2.05);
}

function scheduleBar(index: number, t: number) {
  const chord = CHORDS[index % CHORDS.length];
  // the chord overlaps a little into the next bar, so the changes glide
  pad(t, chord.voice, BEAT * 4.2, 0.045);
  for (let eighth = 0; eighth < 8; eighth++) {
    bass(t + eighth * BEAT * 0.5, chord.arp[eighth % 4], BEAT * 0.42, eighth % 2 ? 0.12 : 0.2);
  }
  for (let beat = 0; beat < 4; beat++) hat(t + (beat + 0.5) * BEAT, 0.06);
  if (index % 4 === 2) pluck(t + BEAT * 3, chord.voice[2] + 5, 0.1);
}

function tick() {
  if (!ctx) return;
  while (nextBar < ctx.currentTime + 0.8) {
    scheduleBar(bar++, nextBar);
    nextBar += BAR;
  }
}

export async function play() {
  if (!ctx) build();
  const audio = ctx!;
  await audio.resume();
  const now = audio.currentTime;
  master!.gain.cancelScheduledValues(now);
  master!.gain.setValueAtTime(master!.gain.value, now);
  master!.gain.linearRampToValueAtTime(VOLUME, now + 2.5);
  if (!scheduler) {
    nextBar = now + 0.1;
    bar = 0;
    tick();
    scheduler = setInterval(tick, 250);
  }
  setPlaying(true);
}

export function pause() {
  setPlaying(false);
  if (!ctx) return;
  const audio = ctx;
  const now = audio.currentTime;
  master!.gain.cancelScheduledValues(now);
  master!.gain.setValueAtTime(master!.gain.value, now);
  master!.gain.linearRampToValueAtTime(0, now + 0.5);
  clearInterval(scheduler);
  scheduler = undefined;
  setTimeout(() => !playing && void audio.suspend(), 600);
}

export function toggle() {
  if (playing) pause();
  else void play();
}

/**
 * Starts the music on the visitor's first interaction, unless they turned it off before.
 * Presses on the music button itself are left to the button. Returns a cleanup function.
 */
export function startOnFirstInteraction() {
  const events = ["pointerdown", "keydown"] as const;
  const stop = () => events.forEach((e) => window.removeEventListener(e, start, true));
  function start(e: Event) {
    if (e.target instanceof Element && e.target.closest("[data-music-toggle]")) return;
    stop();
    if (!playing && wanted()) void play();
  }
  events.forEach((e) => window.addEventListener(e, start, true));
  return stop;
}
