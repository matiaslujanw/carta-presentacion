"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CameraTile, { type Clip } from "./CameraTile";
import Cam3Still from "./Cam3Still";
import DetectionOverlay from "./DetectionOverlay";
import Logo from "./Logo";
import {
  BRAND,
  CAMERAS,
  DEFAULT_CONSORCIO,
  DETECTION,
  EVENT_CAMERA,
  EVENT_TAKE,
  INTRUDER,
  REPORT,
  RESPONSE_TARGET,
} from "@/lib/config";

/**
 * Presentación de venta.
 *
 * Una portada, la simulación en tres momentos y las tarjetas de cómo actúa la
 * central. Sin barra de menú ni chrome de software: la idea es que un vecino
 * entienda el operativo en cuarenta segundos, desde el celular.
 *
 * El panel completo de la central vive aparte, en /panel.
 */

type Scene = "cover" | "deteccion" | "disuasion" | "despejado" | "tarjetas";

const ORDER: Scene[] = ["cover", "deteccion", "disuasion", "despejado", "tarjetas"];

/** Cuánto dura cada momento en modo automático, para el QR */
const AUTO_MS: Record<Scene, number> = {
  cover: 4500,
  deteccion: 8000,
  disuasion: 9000,
  despejado: 7000,
  tarjetas: 14000,
};

const BEATS: Record<
  "deteccion" | "disuasion" | "despejado",
  { tag: string; hora: string; titulo: string; texto: string; cta: string }
> = {
  deteccion: {
    tag: "La IA detecta",
    hora: "03:14:22",
    titulo: "Alguien está merodeando la reja",
    texto:
      "La analítica de video lo marca sola, con 98% de confianza. Nadie en el edificio se enteró todavía, y no sonó ninguna sirena.",
    cta: "¿Y ahora qué pasa?",
  },
  disuasion: {
    tag: "Responde una persona",
    hora: "03:14:25",
    titulo: "Tres segundos después hay un operador mirando",
    texto:
      "No es un robot: es alguien de la central que ve la misma imagen y le habla por el altoparlante del tótem. «Usted está siendo filmado y la policía está en camino.»",
    cta: "Ver qué hace el sospechoso",
  },
  despejado: {
    tag: "Se va",
    hora: "03:14:31",
    titulo: "Perímetro despejado",
    texto:
      "Se retiró solo. Sin daños, sin patrullero, sin que nadie del consorcio se despertara. A la mañana el administrador tiene el reporte en su correo.",
    cta: "Cómo actuamos, paso a paso",
  },
};

const PASOS = [
  {
    n: "01",
    titulo: "La IA vigila sin parar",
    texto:
      "La analítica mira las cámaras del consorcio las 24 horas y marca lo que se sale de lo normal: alguien merodeando, alguien donde no debería estar, a la hora que no corresponde.",
    pie: "Analítica de video · 4 cámaras + tótem",
  },
  {
    n: "02",
    titulo: "Una persona verifica en 3 segundos",
    texto:
      "Acá está la diferencia. Un operador real abre la imagen y decide. Por eso el consorcio no recibe alarmas a las tres de la mañana cada vez que pasa un gato.",
    pie: "Central de Monitoreo Vig.IA — NOA",
  },
  {
    n: "03",
    titulo: "El tótem habla",
    texto:
      "El operador emite audio en vivo por el altoparlante del tótem. La mayoría se va antes de intentar nada: saber que hay alguien mirando y hablando es lo que disuade.",
    pie: "Audio disuasivo en vivo · 92 dB",
  },
  {
    n: "04",
    titulo: "El administrador recibe todo",
    texto:
      "Reporte automático por correo con la hora, el tipo de evento, la evidencia en video y la minuta completa de lo que hizo el operador. Sin pedirlo.",
    pie: "Reporte automático · cada evento",
  },
];

export default function Presentation() {
  const [scene, setScene] = useState<Scene>("cover");
  const [consorcio, setConsorcio] = useState(DEFAULT_CONSORCIO);
  const [auto, setAuto] = useState(false);
  const [sello, setSello] = useState(true);
  const [confidence, setConfidence] = useState<number>(DETECTION.confidenceStart);
  const [clipsOk, setClipsOk] = useState(true);

  // En pantalla chica la etiqueta de la IA va en versión corta: la larga se
  // monta encima del rótulo de la cámara.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const eventCam = CAMERAS.find((c) => c.id === EVENT_CAMERA)!;
  const coverCam = CAMERAS.find((c) => c.id === 1)!;
  const topRef = useRef<HTMLDivElement>(null);

  /* ── ?consorcio= · ?modo=auto · ?sello=off ── */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const c = q.get("consorcio");
    if (c) setConsorcio(c.slice(0, 60));
    setAuto(q.get("modo") === "auto");
    setSello(q.get("sello") !== "off");
  }, []);

  /* ── La confianza sube cuando la IA engancha el objetivo ── */
  useEffect(() => {
    if (scene !== "deteccion") {
      if (scene === "disuasion" || scene === "despejado") setConfidence(DETECTION.confidence);
      return;
    }
    setConfidence(DETECTION.confidenceStart);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1400);
      const eased = 1 - Math.pow(1 - p, 3);
      setConfidence(
        DETECTION.confidenceStart + (DETECTION.confidence - DETECTION.confidenceStart) * eased,
      );
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scene]);

  const go = useCallback((s: Scene) => {
    setScene(s);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const next = useCallback(() => {
    const i = ORDER.indexOf(scene);
    go(ORDER[Math.min(i + 1, ORDER.length - 1)]);
  }, [scene, go]);

  const restart = useCallback(() => go("cover"), [go]);

  /* ── Modo automático, el del QR ── */
  useEffect(() => {
    if (!auto) return;
    const id = setTimeout(() => {
      if (scene === "tarjetas") restart();
      else next();
    }, AUTO_MS[scene]);
    return () => clearTimeout(id);
  }, [auto, scene, next, restart]);

  /* ── Tramo del clip según el momento ── */
  const activeRange =
    scene === "despejado" ? "flee" : scene === "cover" ? "idle" : "intruder";
  const clips: Clip[] | undefined = clipsOk
    ? [
        { src: EVENT_TAKE.src, active: activeRange === "idle", ...EVENT_TAKE.idle },
        { src: EVENT_TAKE.src, active: activeRange === "intruder", ...EVENT_TAKE.intruder },
        { src: EVENT_TAKE.src, active: activeRange === "flee", loop: false, ...EVENT_TAKE.flee },
      ]
    : undefined;

  const isBeat = scene === "deteccion" || scene === "disuasion" || scene === "despejado";
  const beat = isBeat ? BEATS[scene] : null;
  const stepIndex = ORDER.indexOf(scene);

  return (
    <div ref={topRef} className="min-h-[100dvh] bg-void text-ink">
      {/* ══════════ PORTADA ══════════ */}
      {scene === "cover" && (
        <section className="relative flex min-h-[100dvh] flex-col overflow-hidden">
          {/* Fondo ambiental */}
          <div className="pointer-events-none absolute inset-0">
            {coverCam.video && (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                src={coverCam.video}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
                style={{ filter: "brightness(0.42) saturate(0.55) blur(2px)" }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-void/70 via-void/80 to-void" />
          </div>

          <div className="relative z-10 flex flex-1 flex-col px-6 py-8 sm:px-10">
            <Logo size="md" />

            <div className="flex flex-1 flex-col justify-center py-10">
              <p className="text-[12px] font-semibold tracking-[0.2em] text-goldhi uppercase">
                Consorcio {consorcio}
              </p>
              <h1 className="mt-4 max-w-[16ch] text-[clamp(34px,8vw,64px)] leading-[1.02] font-bold tracking-tight text-balance">
                Así cuidamos su edificio a las <span className="text-goldhi">3 de la mañana</span>.
              </h1>
              <p className="mt-5 max-w-[52ch] text-[clamp(16px,2.4vw,20px)] leading-relaxed text-ink2">
                Una simulación de un minuto con un caso real de intrusión en el perímetro: qué ve
                la inteligencia artificial, qué hace nuestra central y qué recibe el administrador.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={() => go("deteccion")}
                  className="cta-glow flex items-center justify-center gap-3 rounded-2xl bg-gold px-8 py-5 text-[18px] font-bold text-black transition-all hover:brightness-110"
                >
                  Empezar simulación
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <button
                  onClick={() => go("tarjetas")}
                  className="rounded-2xl border border-line2 px-6 py-5 text-[16px] font-semibold text-ink2 transition-colors hover:bg-white/[0.05]"
                >
                  Ver cómo actuamos
                </button>
              </div>
            </div>

            <p className="text-[12px] text-muted">
              {sello && "Simulación demostrativa · "}
              {BRAND.central}
            </p>
          </div>
        </section>
      )}

      {/* ══════════ SIMULACIÓN ══════════ */}
      {isBeat && beat && (
        <section className="flex min-h-[100dvh] flex-col">
          <header className="flex items-center gap-4 px-4 py-4 sm:px-8">
            <Logo size="sm" />
            <div className="ml-auto flex items-center gap-2">
              {(["deteccion", "disuasion", "despejado"] as const).map((s, i) => (
                <span
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    ORDER.indexOf(s) <= stepIndex ? "w-7 bg-gold" : "w-3 bg-line2"
                  }`}
                />
              ))}
            </div>
          </header>

          <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col justify-center gap-6 px-4 pb-8 sm:px-8">
            <CameraTile
              camera={eventCam}
              clock={beat.hora}
              state={scene === "despejado" ? "cleared" : "alert"}
              clips={clips}
              onClipsFailed={() => setClipsOk(false)}
              className="aspect-video w-full overflow-hidden rounded-xl"
            >
              {scene !== "despejado" && (
                <DetectionOverlay
                  phase="lurking"
                  showBox
                  confidence={confidence}
                  compact={narrow}
                  showFigure={!clipsOk}
                  box={clipsOk ? INTRUDER.boxBaked : INTRUDER.box}
                />
              )}
            </CameraTile>

            <div>
              <div className="flex items-center gap-2.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    scene === "despejado" ? "bg-ok" : "rec-pulse bg-alert"
                  }`}
                />
                <span
                  className={`text-[12px] font-bold tracking-[0.18em] uppercase ${
                    scene === "despejado" ? "text-ok" : "text-alert"
                  }`}
                >
                  {beat.tag}
                </span>
                <span className="font-mono text-[12px] text-muted">{beat.hora}</span>
              </div>

              <h2 className="mt-3 max-w-[20ch] text-[clamp(24px,4.6vw,40px)] leading-[1.1] font-bold tracking-tight text-balance">
                {beat.titulo}
              </h2>
              <p className="mt-3 max-w-[60ch] text-[clamp(15px,2.1vw,19px)] leading-relaxed text-ink2">
                {beat.texto}
              </p>

              {scene === "disuasion" && (
                <div className="mt-5 inline-flex items-center gap-3 rounded-xl border border-gold/40 bg-golddim/40 px-4 py-3">
                  <span className="font-mono text-[26px] leading-none font-bold text-ok tabular-nums">
                    {RESPONSE_TARGET},0 s
                  </span>
                  <span className="text-[13px] leading-tight text-ink2">
                    de la detección
                    <br />a la voz del operador
                  </span>
                </div>
              )}

              <button
                onClick={next}
                className="mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-gold px-7 py-4.5 text-[17px] font-bold text-black transition-all hover:brightness-110 sm:w-auto"
              >
                {beat.cta}
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M13 5l7 7-7 7v-4H4v-6h9z" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ══════════ CÓMO ACTUAMOS ══════════ */}
      {scene === "tarjetas" && (
        <section className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-8 sm:py-12">
          <header className="flex items-center gap-4 pb-8">
            <Logo size="sm" />
          </header>

          <p className="text-[12px] font-semibold tracking-[0.2em] text-goldhi uppercase">
            Cómo actuamos
          </p>
          <h2 className="mt-3 max-w-[18ch] text-[clamp(28px,5.4vw,48px)] leading-[1.05] font-bold tracking-tight text-balance">
            Cuatro pasos, y uno de ellos lo hace una persona.
          </h2>
          <p className="mt-4 max-w-[58ch] text-[clamp(15px,2.1vw,19px)] leading-relaxed text-ink2">
            La inteligencia artificial detecta. La decisión, siempre, la toma alguien de nuestra
            central. Eso es lo que evita las falsas alarmas y lo que hace que el sospechoso se
            vaya antes de intentar nada.
          </p>

          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {PASOS.map((p) => (
              <article
                key={p.n}
                className="rounded-2xl border border-line bg-panel p-6 transition-colors hover:border-gold/30"
              >
                <span className="font-mono text-[13px] font-bold text-gold">{p.n}</span>
                <h3 className="mt-2 text-[19px] leading-tight font-bold tracking-tight">
                  {p.titulo}
                </h3>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink2">{p.texto}</p>
                <p className="mt-4 border-t border-line pt-3 font-mono text-[11.5px] text-muted">
                  {p.pie}
                </p>
              </article>
            ))}
          </div>

          {/* La evidencia que le llega al administrador */}
          <div className="mt-10 rounded-2xl border border-line bg-panel p-6">
            <p className="text-[12px] font-semibold tracking-[0.18em] text-goldhi uppercase">
              Lo que recibe el administrador
            </p>
            <h3 className="mt-2 text-[22px] font-bold tracking-tight">
              {REPORT.status}
            </h3>
            <p className="mt-2 max-w-[56ch] text-[14.5px] leading-relaxed text-ink2">
              Un correo automático con la hora exacta, el tipo de evento, la clasificación del
              operador y las capturas del antes y el después. Sin pedirlo y sin costo adicional.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <figure className="overflow-hidden rounded-xl border border-line bg-black">
                <Cam3Still uid="pres-a" kind="intruder" time="03:14:22" />
                <figcaption className="border-t border-line bg-elev px-3 py-2 text-[12px] text-muted">
                  03:14:22 — Intruso detectado por la IA.
                </figcaption>
              </figure>
              <figure className="overflow-hidden rounded-xl border border-line bg-black">
                <Cam3Still uid="pres-b" kind="clear" time="03:14:31" />
                <figcaption className="border-t border-line bg-elev px-3 py-2 text-[12px] text-muted">
                  03:14:31 — Perímetro despejado tras el aviso.
                </figcaption>
              </figure>
            </div>
          </div>

          {/* Cierre */}
          <div className="mt-10 rounded-2xl border border-gold/30 bg-golddim/25 p-7">
            <h3 className="max-w-[22ch] text-[clamp(21px,3.4vw,30px)] leading-tight font-bold tracking-tight text-balance">
              ¿Lo llevamos al Consorcio {consorcio}?
            </h3>
            <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-ink2">
              Hacemos un relevamiento del edificio sin cargo y les decimos exactamente dónde
              conviene poner cada cámara y el tótem.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={`https://wa.me/${BRAND.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 rounded-2xl bg-gold px-7 py-4 text-[16px] font-bold text-black transition-all hover:brightness-110"
              >
                Hablar por WhatsApp
              </a>
              <button
                onClick={restart}
                className="rounded-2xl border border-line2 px-6 py-4 text-[15px] font-semibold text-ink2 transition-colors hover:bg-white/[0.05]"
              >
                Volver a ver la simulación
              </button>
            </div>
            <p className="mt-5 text-[12.5px] text-muted">
              {BRAND.central} · {BRAND.phone} · {BRAND.email}
              {sello && " · Simulación demostrativa"}
            </p>
          </div>
        </section>
      )}

      {/* Progreso del modo automático, el del QR */}
      {auto && (
        <div className="fixed inset-x-0 top-0 z-50 flex items-center gap-3 bg-black/75 px-4 py-1.5 backdrop-blur-sm">
          <span className="rec-pulse h-1.5 w-1.5 rounded-full bg-gold" />
          <span className="text-[10px] font-semibold tracking-[0.16em] text-goldhi uppercase">
            Reproducción automática
          </span>
          <span className="ml-auto font-mono text-[10px] text-muted">
            {stepIndex + 1} / {ORDER.length}
          </span>
        </div>
      )}
    </div>
  );
}
