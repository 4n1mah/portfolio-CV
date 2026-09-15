// Background music, synthesized live with the Web Audio API: a slow lo-fi loop in F major (warm pad chords,
// a soft bass and a few loose piano-like notes through a delay and a reverb). No audio files to download or license.
// Browsers only allow sound after the visitor interacts with the page, so it starts on the first click, tap or key,
// unless it was turned off on an earlier visit.

const STORAGE_KEY = "portfolio-music";
const VOLUME = 0.45;
const BPM = 68;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
// Two bars per chord. Bass note and pad voicing as MIDI numbers; the pads share notes so the changes glide.
const CHORDS = [
  { bass: 41, pad: [53, 57, 60, 64] }, // Fmaj7
  { bass: 38, pad: [53, 57, 60, 64] }, // Dm9
  { bass: 46, pad: [50, 53, 57, 60] }, // Bbmaj9
  { bass: 36, pad: [52, 55, 57, 62] }, // C6/9
];
// F major pentatonic for the melody
const SCALE = [65, 67, 69, 72, 74, 77, 79];

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

type Listener = () => void;
const listeners = new Set<Listener>();
let playing = false;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let padBus: AudioNode | null = null;
let pluckBus: AudioNode | null = null;
let bassBus: AudioNode | null = null;
let scheduler: ReturnType<typeof setInterval> | undefined;
let nextBar = 0;
let bar = 0;
let melodyStep = 3;

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

/** A few seconds of decaying stereo noise: a cheap, soft room reverb. */
function impulse(audio: AudioContext, seconds: number) {
  const length = Math.floor(audio.sampleRate * seconds);
  const buffer = audio.createBuffer(2, length, audio.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
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
  reverb.buffer = impulse(audio, 3.2);
  const wet = audio.createGain();
  wet.gain.value = 0.35;
  reverb.connect(wet).connect(out);

  const bus = (cutoff: number, send: number) => {
    const filter = audio.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    filter.connect(out);
    const toReverb = audio.createGain();
    toReverb.gain.value = send;
    filter.connect(toReverb).connect(reverb);
    return filter;
  };
  padBus = bus(1100, 0.8);
  bassBus = bus(420, 0.1);

  // melody: an echo a dotted eighth later, a little darker each repeat
  const pluck = bus(2600, 0.6);
  const delay = audio.createDelay(1);
  delay.delayTime.value = BEAT * 0.75;
  const feedback = audio.createGain();
  feedback.gain.value = 0.28;
  const tone = audio.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 1800;
  pluck.connect(delay).connect(tone).connect(feedback).connect(delay);
  tone.connect(out);
  pluckBus = pluck;

  document.addEventListener("visibilitychange", () => {
    if (!playing) return;
    if (document.hidden) void audio.suspend();
    else void audio.resume();
  });

  ctx = audio;
  master = out;
}

function voice(bus: AudioNode, type: OscillatorType, freq: number, t: number, peak: number, attack: number, hold: number, release: number, detune = 0) {
  const audio = ctx!;
  const osc = audio.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  const env = audio.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(peak, t + attack);
  env.gain.setValueAtTime(peak, t + attack + hold);
  env.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
  osc.connect(env).connect(bus);
  osc.start(t);
  osc.stop(t + attack + hold + release + 0.05);
}

function scheduleBar(index: number, t: number) {
  const chord = CHORDS[Math.floor(index / 2) % CHORDS.length];
  if (index % 2 === 0) {
    // pads swell over the two bars of their chord and overlap into the next one
    for (const note of chord.pad) {
      voice(padBus!, "triangle", hz(note), t, 0.028, 1.6, BAR * 2 - 2.2, 2.4, -5);
      voice(padBus!, "sine", hz(note), t, 0.03, 1.6, BAR * 2 - 2.2, 2.4, 6);
    }
  }
  voice(bassBus!, "sine", hz(chord.bass), t, 0.16, 0.03, BEAT * 1.2, BEAT * 0.8);
  voice(bassBus!, "sine", hz(chord.bass), t + BEAT * 2.5, 0.11, 0.03, BEAT * 0.6, BEAT * 0.8);

  // a few loose notes, wandering step by step through the scale, with a lazy swing on the off-beats
  const busy = index % 8 < 6 ? 0.3 : 0.12;
  for (let eighth = 0; eighth < 8; eighth++) {
    if (Math.random() > busy) continue;
    melodyStep = Math.min(SCALE.length - 1, Math.max(0, melodyStep + [-2, -1, -1, 1, 1, 2][Math.floor(Math.random() * 6)]));
    const at = t + eighth * (BEAT / 2) + (eighth % 2 ? BEAT * 0.08 : 0);
    const velocity = 0.05 + Math.random() * 0.03;
    voice(pluckBus!, "sine", hz(SCALE[melodyStep]), at, velocity, 0.005, 0.02, 1.6);
    voice(pluckBus!, "triangle", hz(SCALE[melodyStep] + 12), at, velocity * 0.25, 0.005, 0.01, 0.6);
  }
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
