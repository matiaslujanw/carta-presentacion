/**
 * Sonido de la demo.
 *
 * Los sonidos de máquina —la alarma de la analítica, el clic del altoparlante—
 * se sintetizan acá con Web Audio: no hay archivos que descargar, funciona sin
 * red y suena igual en cualquier equipo.
 *
 * La VOZ DEL OPERADOR es otra cosa: tiene que ser una persona de verdad. Va
 * como archivo en /public/audio/operador.mp3 (ver VOICE_SRC más abajo). Si el
 * archivo no está, la demo no pone una voz sintética en su lugar —sonaría a
 * robot y contradice justo lo que estamos vendiendo—: se queda con el texto en
 * pantalla y el resto del operativo.
 */

/** Grabación de la voz del operador. Si no existe, se omite. */
export const VOICE_SRC = "/audio/operador.mp3";

/** Volumen general. Bajo a propósito: esto se muestra en reuniones. */
const MASTER = 0.16;

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

/**
 * Los navegadores sólo dejan sonar después de que la persona tocó algo.
 * Se llama desde el botón "Ver demo".
 *
 * A Safari en iPhone no le alcanza con resume(): hasta que no suena algo
 * DENTRO del mismo toque, no considera el audio desbloqueado. Por eso se
 * dispara un buffer mudo de un frame, que no se oye y sirve de llave.
 */
export function unlockAudio() {
  const c = getCtx();
  if (!c) return;
  try {
    const src = c.createBufferSource();
    src.buffer = c.createBuffer(1, 1, c.sampleRate);
    src.connect(c.destination);
    src.start(0);
  } catch {
    // Si el navegador no deja, igual se intenta el resume de abajo
  }
  if (c.state === "suspended") void c.resume();
}

/**
 * Corre `fn` con el contexto ya despierto.
 *
 * Importa el orden: resume() es asincrónico, y si se agendan los sonidos
 * mientras el contexto todavía duerme, se agendan contra un reloj que no
 * avanza. Cuando despierta ya pasó su horario y no suenan nunca. Esa carrera
 * se pierde más seguido en un celular que en una computadora, así que acá se
 * espera a que el contexto esté corriendo y sólo entonces se lee currentTime.
 */
function schedule(fn: (c: AudioContext) => void) {
  const c = getCtx();
  if (!c) return;
  if (c.state === "running") {
    fn(c);
    return;
  }
  void c.resume().then(
    () => {
      if (c.state === "running") fn(c);
    },
    () => {
      // Sin permiso del navegador no hay sonido, y no hay nada que hacer
    },
  );
}

type ToneOpts = {
  freq: number;
  /** segundos desde ahora */
  at?: number;
  dur?: number;
  type?: OscillatorType;
  gain?: number;
};

function tone(c: AudioContext, { freq, at = 0, dur = 0.12, type = "square", gain = 1 }: ToneOpts) {
  const t0 = c.currentTime + at;
  const osc = c.createOscillator();
  const amp = c.createGain();
  const filter = c.createBiquadFilter();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);

  // Un pasabajos suave le saca el filo de sintetizador barato
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(3200, t0);

  amp.gain.setValueAtTime(0, t0);
  amp.gain.linearRampToValueAtTime(MASTER * gain, t0 + 0.012);
  amp.gain.setValueAtTime(MASTER * gain, t0 + dur - 0.03);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  osc.connect(filter).connect(amp).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/** Ráfaga de ruido: el "pff" de un altoparlante que se abre */
function noise(c: AudioContext, { at = 0, dur = 0.18, gain = 0.5 }: { at?: number; dur?: number; gain?: number }) {
  const t0 = c.currentTime + at;
  const frames = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, frames, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    // Ruido que se apaga solo hacia el final
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }
  const src = c.createBufferSource();
  const filter = c.createBiquadFilter();
  const amp = c.createGain();
  src.buffer = buf;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1400, t0);
  filter.Q.setValueAtTime(0.8, t0);
  amp.gain.setValueAtTime(MASTER * gain, t0);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(amp).connect(c.destination);
  src.start(t0);
  src.stop(t0 + dur);
}

/** Alarma de la analítica: tres pulsos de dos tonos, como una central real */
export function playAlarm() {
  schedule((c) => {
    for (let i = 0; i < 3; i++) {
      const base = i * 0.34;
      tone(c, { freq: 932, at: base, dur: 0.13, type: "square", gain: 0.55 });
      tone(c, { freq: 1245, at: base + 0.15, dur: 0.13, type: "square", gain: 0.55 });
    }
  });
}

/** El enganche del recuadro sobre el objetivo */
export function playLock() {
  schedule((c) => {
    tone(c, { freq: 1660, at: 0, dur: 0.05, type: "sine", gain: 0.5 });
    tone(c, { freq: 2200, at: 0.06, dur: 0.07, type: "sine", gain: 0.4 });
  });
}

/** El altoparlante del tótem abriendo el canal */
export function playPaOpen() {
  schedule((c) => {
    tone(c, { freq: 220, at: 0, dur: 0.04, type: "triangle", gain: 0.7 });
    noise(c, { at: 0.03, dur: 0.22, gain: 0.35 });
  });
}

/** El altoparlante cerrando */
export function playPaClose() {
  schedule((c) => {
    noise(c, { at: 0, dur: 0.09, gain: 0.25 });
    tone(c, { freq: 180, at: 0.05, dur: 0.05, type: "triangle", gain: 0.5 });
  });
}

/** Incidente cerrado: dos notas que bajan, tranquilas */
export function playResolve() {
  schedule((c) => {
    tone(c, { freq: 784, at: 0, dur: 0.16, type: "sine", gain: 0.5 });
    tone(c, { freq: 523, at: 0.18, dur: 0.3, type: "sine", gain: 0.45 });
  });
}

/**
 * Reproduce la grabación del operador si el archivo existe.
 * Devuelve la duración real en segundos, o 0 si no hay grabación.
 */
export function playVoice(): Promise<number> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(0);
    const a = new Audio(VOICE_SRC);
    a.volume = 0.9;
    const fail = () => resolve(0);
    a.addEventListener("error", fail, { once: true });
    a.addEventListener(
      "loadedmetadata",
      () => {
        void a.play().then(
          () => resolve(Number.isFinite(a.duration) ? a.duration : 0),
          fail,
        );
      },
      { once: true },
    );
    a.load();
    currentVoice = a;
  });
}

let currentVoice: HTMLAudioElement | null = null;

/** Corta la voz si el usuario avanza antes de que termine */
export function stopVoice() {
  if (currentVoice) {
    currentVoice.pause();
    currentVoice = null;
  }
}

/** ¿Hay grabación del operador en el servidor? */
export function probeVoice(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    const a = new Audio();
    a.preload = "metadata";
    a.addEventListener("loadedmetadata", () => resolve(true), { once: true });
    a.addEventListener("error", () => resolve(false), { once: true });
    a.src = VOICE_SRC;
  });
}
