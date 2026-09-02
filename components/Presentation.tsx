"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  playAlarm,
  playLock,
  playPaClose,
  playPaOpen,
  playResolve,
  playVoice,
  probeVoice,
  stopVoice,
  unlockAudio,
} from "@/lib/sound";
import CameraTile, { type Clip } from "./CameraTile";
import Cam3Still from "./Cam3Still";
import DetectionOverlay from "./DetectionOverlay";
import Logo from "./Logo";
import ProductScene, { type ProductSceneKey } from "./ProductScenes";
import {
  BRAND,
  CAMERAS,
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
 * Sigue el guion aprobado, escena por escena: la portada, el caso de intrusión
 * de la madrugada en tres momentos, el paso a paso de cómo actúa la central, el
 * reporte que le llega al administrador y las cuatro escenas del servicio de
 * todos los días (accesos, tótem, cocheras y trazabilidad).
 *
 * Sin barra de menú ni chrome de software: se avanza con un botón por escena,
 * así el vendedor maneja el ritmo desde el celular.
 *
 * El panel completo de la central vive aparte, en /panel.
 */

type Scene =
  | "cover" // Escena 1 — portada
  | "deteccion" // Escena 2 — la IA detecta el merodeo
  | "disuasion" // Escena 3 — el operador habla por el altoparlante
  | "despejado" // Escena 4 — perímetro despejado
  | "pasos" // Escena 5 — el paso a paso, 01 a 04
  | "reporte" // Reporte al administrador
  | "accesos" // Escena 6 — control de acceso biométrico
  | "totem" // Escena 7 — Tótem IA
  | "lpr" // Escena 8 — cocheras con cámara LPR
  | "trazabilidad" // Escena 9 — trazabilidad de registros
  | "cierre"; // Cierre — relevamiento sin cargo

const ORDER: Scene[] = [
  "cover",
  "deteccion",
  "disuasion",
  "despejado",
  "pasos",
  "reporte",
  "accesos",
  "totem",
  "lpr",
  "trazabilidad",
  "cierre",
];

/** Número de escena del guion. El reporte y el cierre no llevan número propio. */
const SCENE_NUM: Record<Scene, string> = {
  cover: "01",
  deteccion: "02",
  disuasion: "03",
  despejado: "04",
  pasos: "05",
  reporte: "05",
  accesos: "06",
  totem: "07",
  lpr: "08",
  trazabilidad: "09",
  cierre: "09",
};

/** Cuánto dura cada escena en modo automático, para el QR */
const AUTO_MS: Record<Scene, number> = {
  cover: 5000,
  deteccion: 8000,
  disuasion: 9000,
  despejado: 7000,
  pasos: 13000,
  reporte: 8000,
  accesos: 10000,
  totem: 13000,
  lpr: 9000,
  trazabilidad: 9000,
  cierre: 10000,
};

/** Textos de avance, tal como los pide el guion */
const CTA: Record<Scene, string> = {
  cover: "Ver demo",
  deteccion: "¿Y ahora qué pasa?",
  disuasion: "¿Qué hace el sospechoso?",
  despejado: "Paso a paso",
  pasos: "Reporte al administrador",
  reporte: "Vigilancia 24/7",
  accesos: "Tótem IA",
  totem: "Acceso a cocheras",
  lpr: "Trazabilidad de registros",
  trazabilidad: "Cómo seguimos",
  cierre: "",
};

const BEATS: Record<
  "deteccion" | "disuasion" | "despejado",
  { tag: string; hora: string; titulo: string; texto: string; cita?: string }
> = {
  deteccion: {
    tag: "La IA detecta",
    hora: "03:14:22",
    titulo: "Una persona es detectada por la IA merodeando una zona prohibida",
    texto:
      "La analítica de video lo marca sola, con 98% de confianza. Nadie en el edificio se enteró todavía, y no sonó ninguna sirena.",
  },
  disuasion: {
    tag: "Responde una persona",
    hora: "03:14:25",
    titulo: "Solo 3 segundos después, un operador recibe el alerta por imagen en vivo",
    texto:
      "No es un robot: es un guardia que ve la imagen en vivo y actúa según protocolo establecido. En este caso emite un mensaje al intruso mediante altavoz.",
    cita: "Usted está siendo filmado y la policía está en camino. Retírese del perímetro inmediatamente.",
  },
  despejado: {
    tag: "Se va",
    hora: "03:14:31",
    titulo: "Perímetro despejado",
    texto:
      "El intruso se retira del lugar sin lograr su cometido y sin emitir alerta a todo el consorcio en la madrugada. A la mañana siguiente, el administrador tiene en su correo el reporte completo de lo acontecido.",
  },
};

const PASOS = [
  {
    n: "01",
    titulo: "La IA vigila sin descanso",
    texto:
      "La analítica observa las cámaras del consorcio durante las 24 horas del día, los 365 días del año, y emite las alertas predeterminadas: alguien merodeando, alguien detectado en una zona roja o un horario no habitual.",
    pie: "Analítica de video — cámaras + Tótem IA",
  },
  {
    n: "02",
    titulo: "Un operador verifica el alerta en solo 3 segundos",
    texto:
      "Acá está la diferencia. El operador abre la imagen en vivo y actúa según protocolo. Esto evita que todo el consorcio reciba falsas alertas.",
    pie: "Central de Monitoreo Vig.IA",
  },
  {
    n: "03",
    titulo: "Emisión de alerta",
    texto:
      "El operador emite un audio en vivo por altoparlante. El intruso desiste de su actitud y se retira del lugar: sabe que lo están filmando y que están llamando al 911.",
    pie: "Audio disuasivo en vivo",
  },
  {
    n: "04",
    titulo: "Informe detallado al consorcio",
    texto:
      "El administrador recibe en su correo electrónico un informe detallado de lo acontecido, con la hora, el tipo de evento, la evidencia de video y la minuta del protocolo de actuación.",
    pie: "Reporte automático",
  },
];

/* ── Onda del audio del tótem. Determinista, para no romper la hidratación ── */
const BARS = Array.from({ length: 26 }, (_, i) => ({
  h: 0.2 + 0.8 * Math.abs(Math.sin(i * 1.37) * Math.cos(i * 0.61)),
  d: (i % 7) * 0.09,
}));

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-10 items-center justify-between gap-[3px]">
      {BARS.map((b, i) => (
        <span
          key={i}
          className={active ? "wave-bar" : ""}
          style={{
            width: 4,
            height: `${(active ? b.h : 0.07) * 100}%`,
            minHeight: 3,
            borderRadius: 2,
            background: active
              ? "linear-gradient(to top, #c08f27, #f1cf6b)"
              : "rgba(255,255,255,0.14)",
            animationDelay: `${b.d}s`,
            animationDuration: `${0.5 + (i % 5) * 0.07}s`,
            transition: "height .3s ease",
          }}
        />
      ))}
    </div>
  );
}

export default function Presentation() {
  const [scene, setScene] = useState<Scene>("cover");
  const [auto, setAuto] = useState(false);
  const [sello, setSello] = useState(true);
  const [confidence, setConfidence] = useState<number>(DETECTION.confidenceStart);
  const [clipsOk, setClipsOk] = useState(true);
  const [sound, setSound] = useState(true);
  const [hasVoice, setHasVoice] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  // Sin un toque previo el navegador no deja sonar. En modo automático
  // (el del QR) no hay toque, así que se ofrece activarlo.
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isLocal, setIsLocal] = useState(false);

  // Safari en iPhone silencia el Web Audio cuando el teléfono está en silencio,
  // y toda la demo suena con Web Audio. No hay forma de saltearlo por código
  // —el interruptor manda—, así que se avisa antes de arrancar: en una reunión
  // no hay tiempo para descubrir por qué no se escucha nada.
  const [isIOS, setIsIOS] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    // iPadOS se reporta como Mac, se lo distingue por el táctil
    setIsIOS(
      /iP(hone|od|ad)/.test(ua) ||
        (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1),
    );
  }, []);

  // La etiqueta larga de la IA ("CLASE: PERSONA · TRACK ID · Merodeo
  // sospechoso…") necesita unos 700 px de cuadro. Con menos se monta encima del
  // rótulo de la cámara, así que va en versión corta.
  //
  // Se mide el cuadro y no la ventana: en escritorio la cámara comparte la fila
  // con el relato, así que una ventana grande no significa un cuadro grande.
  const camBoxRef = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  const isBeatScene = scene === "deteccion" || scene === "disuasion" || scene === "despejado";
  useEffect(() => {
    const el = camBoxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setNarrow(entry.contentRect.width < 700));
    ro.observe(el);
    return () => ro.disconnect();
  }, [isBeatScene]);

  useEffect(() => {
    void probeVoice().then(setHasVoice);
    // El recordatorio de que falta la grabación es una nota de trabajo:
    // se muestra sólo en local, nunca delante de un cliente.
    setIsLocal(/^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(window.location.hostname));
  }, []);

  const eventCam = CAMERAS.find((c) => c.id === EVENT_CAMERA)!;
  const coverCam = CAMERAS.find((c) => c.id === 1)!;
  const topRef = useRef<HTMLDivElement>(null);

  /* ── ?modo=auto · ?sello=off ──
     El ?consorcio= sigue existiendo, pero sólo lo usa /panel: la presentación
     ya no nombra al consorcio en ninguna pantalla. */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
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

  /* ── El operativo suena: alarma, altoparlante, voz y cierre ── */
  useEffect(() => {
    if (!sound || !audioUnlocked) return;
    let alive = true;
    stopVoice();
    setSpeaking(false);

    if (scene === "deteccion") {
      playAlarm();
      const id = setTimeout(() => alive && playLock(), 1150);
      return () => {
        alive = false;
        clearTimeout(id);
      };
    }

    if (scene === "disuasion") {
      playPaOpen();
      setSpeaking(true);
      const id = setTimeout(() => {
        if (!alive) return;
        void playVoice().then((dur) => {
          if (!alive) return;
          // Sin grabación, la onda igual acompaña al texto en pantalla
          const ms = (dur > 0 ? dur : 5) * 1000;
          setTimeout(() => alive && setSpeaking(false), ms);
        });
      }, 320);
      return () => {
        alive = false;
        clearTimeout(id);
        stopVoice();
      };
    }

    if (scene === "despejado") {
      playPaClose();
      const id = setTimeout(() => alive && playResolve(), 280);
      return () => {
        alive = false;
        clearTimeout(id);
      };
    }

    return () => {
      alive = false;
    };
  }, [scene, sound, audioUnlocked]);

  const go = useCallback((s: Scene) => {
    setScene(s);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const next = useCallback(() => {
    const i = ORDER.indexOf(scene);
    go(ORDER[Math.min(i + 1, ORDER.length - 1)]);
  }, [scene, go]);

  const restart = useCallback(() => {
    stopVoice();
    setSpeaking(false);
    go("cover");
  }, [go]);

  /** El primer toque desbloquea el audio del navegador */
  const enableAudio = useCallback(() => {
    unlockAudio();
    setAudioUnlocked(true);
    setSound(true);
  }, []);

  /* ── Modo automático, el del QR ── */
  useEffect(() => {
    if (!auto) return;
    const id = setTimeout(() => {
      if (scene === "cierre") restart();
      else next();
    }, AUTO_MS[scene]);
    return () => clearTimeout(id);
  }, [auto, scene, next, restart]);

  /* ── Tramo del clip según el momento ── */
  const activeRange =
    scene === "despejado"
      ? "flee"
      : scene === "deteccion" || scene === "disuasion"
        ? "intruder"
        : "idle";
  const clips: Clip[] | undefined = clipsOk
    ? [
        { src: EVENT_TAKE.src, active: activeRange === "idle", ...EVENT_TAKE.idle },
        { src: EVENT_TAKE.src, active: activeRange === "intruder", ...EVENT_TAKE.intruder },
        { src: EVENT_TAKE.src, active: activeRange === "flee", loop: false, ...EVENT_TAKE.flee },
      ]
    : undefined;

  const isBeat = scene === "deteccion" || scene === "disuasion" || scene === "despejado";
  const beat = isBeat ? BEATS[scene] : null;
  const isProduct =
    scene === "accesos" || scene === "totem" || scene === "lpr" || scene === "trazabilidad";
  const stepIndex = ORDER.indexOf(scene);
  const progress = stepIndex / (ORDER.length - 1);

  /* ── Chrome compartido por todas las escenas menos la portada ──
     Logo, sonido y avance del guion. Está una sola vez para que no se pueda
     desincronizar entre escenas. */
  const header = (
    // En modo automático la barra fija del QR se apoya arriba: se le hace lugar.
    <header className={`flex items-center gap-4 px-4 py-4 sm:px-8 ${auto ? "pt-9" : ""}`}>
      <button onClick={restart} aria-label="Volver al inicio" className="shrink-0">
        <Logo size="sm" />
      </button>

      <button
        onClick={() => {
          if (!audioUnlocked) enableAudio();
          else {
            stopVoice();
            setSound((v) => !v);
          }
        }}
        aria-label={sound && audioUnlocked ? "Silenciar" : "Activar sonido"}
        className={`ml-auto flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
          sound && audioUnlocked
            ? "border-gold/40 bg-golddim/40 text-goldhi"
            : "border-line2 text-muted hover:bg-white/[0.05]"
        }`}
      >
        {sound && audioUnlocked ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
            <path d="M4 9v6h3.5L12 18.5v-13L7.5 9H4Z" />
            <path d="M16 9.5a3.5 3.5 0 0 1 0 5M18.5 7a7 7 0 0 1 0 10" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
            <path d="M4 9v6h3.5L12 18.5v-13L7.5 9H4Z" />
            <path d="m16.5 10 4 4m0-4-4 4" />
          </svg>
        )}
        <span className="hidden sm:inline">{sound && audioUnlocked ? "Sonido" : "Activar sonido"}</span>
      </button>

      {/* Avance del guion */}
      <div className="flex shrink-0 items-center gap-2.5">
        <div className="h-1 w-16 overflow-hidden rounded-full bg-line2 sm:w-28">
          <div
            className="h-full rounded-full bg-gold transition-[width] duration-500 ease-out"
            style={{ width: `${Math.max(6, progress * 100)}%` }}
          />
        </div>
        <span className="font-mono text-[11px] text-muted tabular-nums">
          {SCENE_NUM[scene]}
          <span className="text-faint"> / 09</span>
        </span>
      </div>
    </header>
  );

  /** Botón de avance. El texto lo pone el guion, en CTA. */
  const avanzar = (
    <button
      onClick={next}
      className="mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-gold px-7 py-4.5 text-[17px] font-bold text-black transition-all hover:brightness-110 sm:w-auto"
    >
      {CTA[scene]}
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M13 5l7 7-7 7v-4H4v-6h9z" />
      </svg>
    </button>
  );

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
                poster="/cams/cam1-poster.jpg"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
                style={{ filter: "brightness(0.42) saturate(0.55) blur(2px)" }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-void/70 via-void/80 to-void" />
          </div>

          <div className="relative z-10 flex flex-1 flex-col items-center px-6 py-8 text-center sm:px-10">
            <div className="flex flex-1 flex-col items-center justify-center py-10">
              {/* El guion pide la marca grande y al centro */}
              <Logo size="xl" />

              <h1 className="mt-10 max-w-[22ch] text-[clamp(28px,6.6vw,54px)] leading-[1.06] font-bold tracking-tight text-balance uppercase">
                Bienvenidos a la nueva era de la <span className="text-goldhi">seguridad</span>
              </h1>
              <p className="mt-5 max-w-[46ch] text-[clamp(16px,2.4vw,20px)] leading-relaxed text-ink2">
                Servicio de Vigilancia Inteligente 24/7 para Consorcios.
              </p>
              <p className="mt-3 max-w-[46ch] text-[clamp(14px,2vw,17px)] leading-relaxed text-muted">
                Situación de caso de intrusión real a las 03:00 AM.
              </p>

              <button
                onClick={() => {
                  enableAudio();
                  go("deteccion");
                }}
                className="cta-glow mt-9 flex items-center justify-center gap-3 rounded-2xl bg-gold px-10 py-5 text-[18px] font-bold text-black transition-all hover:brightness-110"
              >
                Ver demo
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>

              {isIOS && (
                <p className="mt-5 flex max-w-[34ch] items-start gap-2 text-[12.5px] leading-relaxed text-muted">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-goldhi" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M4 9v6h3.5L12 18.5v-13L7.5 9H4Z" />
                    <path d="m16.5 10 4 4m0-4-4 4" />
                  </svg>
                  <span>
                    Si el iPhone está en silencio no vas a escuchar el operativo:
                    sacalo de silencio con el interruptor lateral.
                  </span>
                </p>
              )}

              {/* Atajo para el vendedor que ya mostró el caso y va al servicio */}
              <button
                onClick={() => go("accesos")}
                className="mt-5 text-[14px] font-semibold text-muted underline decoration-line2 underline-offset-4 transition-colors hover:text-ink2"
              >
                Ir directo al servicio de todos los días
              </button>
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
          {header}

          {/* En celular la cámara va arriba del relato. Desde tablet, al costado:
              si no, el mensaje del operador y el botón caen abajo del pliegue,
              y el vendedor tiene que scrollear en medio de la escena. */}
          <div className="mx-auto grid w-full max-w-[1100px] flex-1 content-center gap-6 px-4 pb-8 sm:px-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:items-center md:gap-8">
            <div ref={camBoxRef}>
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
            </div>

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

              <h2 className="mt-3 max-w-[26ch] text-[clamp(23px,4.2vw,38px)] leading-[1.08] font-bold tracking-tight text-balance uppercase">
                {beat.titulo}
              </h2>
              <p className="mt-3 max-w-[60ch] text-[clamp(15px,2.1vw,19px)] leading-relaxed text-ink2">
                {beat.texto}
              </p>

              {scene === "disuasion" && beat.cita && (
                <div className="mt-5 rounded-xl border border-gold/40 bg-golddim/40 p-4">
                  <div className="flex items-center gap-2.5">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-goldhi" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="9" y="2.5" width="6" height="11" rx="3" />
                      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
                    </svg>
                    <span className="text-[11px] font-bold tracking-[0.16em] text-goldhi uppercase">
                      Altoparlante del tótem
                    </span>
                    {speaking && (
                      <span className="alert-text ml-auto rounded-full bg-alert px-2 py-0.5 text-[9px] font-bold tracking-widest text-white">
                        EN VIVO
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-[clamp(15px,2.2vw,19px)] leading-relaxed font-semibold text-goldhi italic">
                    «{beat.cita}»
                  </p>

                  <div className="mt-3 rounded-lg border border-line bg-black/45 px-3 py-1">
                    <Waveform active={speaking} />
                  </div>

                  <div className="mt-3 flex items-center gap-3 border-t border-gold/20 pt-3">
                    <span className="font-mono text-[24px] leading-none font-bold text-ok tabular-nums">
                      {RESPONSE_TARGET},0 s
                    </span>
                    <span className="text-[12.5px] leading-tight text-ink2">
                      de la detección a la voz del operador
                    </span>
                  </div>

                  {isLocal && !hasVoice && (
                    <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
                      Falta la grabación del operador. Subila a
                      <span className="font-mono text-ink2"> /audio/operador.mp3</span> y se
                      reproduce sola acá.
                    </p>
                  )}
                </div>
              )}

              {avanzar}
            </div>
          </div>
        </section>
      )}

      {/* ══════════ ESCENA 5 · PASO A PASO ══════════ */}
      {scene === "pasos" && (
        <section className="flex min-h-[100dvh] flex-col">
          {header}

          <div className="mx-auto w-full max-w-[1100px] px-4 pb-10 sm:px-8">
            <p className="text-[12px] font-semibold tracking-[0.2em] text-goldhi uppercase">
              Escena 5
            </p>
            <h2 className="mt-3 max-w-[18ch] text-[clamp(26px,5vw,44px)] leading-[1.05] font-bold tracking-tight text-balance uppercase">
              Paso a paso
            </h2>
            <p className="mt-3.5 max-w-[58ch] text-[clamp(15px,2.1vw,19px)] leading-relaxed text-ink2">
              La inteligencia artificial detecta. La decisión, siempre, la toma alguien de nuestra
              central. Eso es lo que evita las falsas alarmas y lo que hace que el sospechoso se
              vaya antes de intentar nada.
            </p>

            <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
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
                  <p className="mt-4 border-t border-line pt-3 font-mono text-[11.5px] tracking-wide text-muted uppercase">
                    [{p.pie}]
                  </p>
                </article>
              ))}
            </div>

            {avanzar}
          </div>
        </section>
      )}

      {/* ══════════ REPORTE AL ADMINISTRADOR ══════════ */}
      {scene === "reporte" && (
        <section className="flex min-h-[100dvh] flex-col">
          {header}

          <div className="mx-auto w-full max-w-[1100px] px-4 pb-10 sm:px-8">
            <p className="text-[12px] font-semibold tracking-[0.2em] text-goldhi uppercase">
              Lo que recibe el administrador
            </p>
            <h2 className="mt-3 max-w-[20ch] text-[clamp(26px,5vw,44px)] leading-[1.05] font-bold tracking-tight text-balance uppercase">
              Reporte al administrador
            </h2>
            <p className="mt-4 max-w-[58ch] text-[clamp(15px,2.1vw,19px)] leading-relaxed text-ink2">
              Un correo automático con la hora exacta, el tipo de evento, la clasificación del
              operador, la evidencia de video y las capturas del antes y el después. Sin pedirlo y
              sin costo adicional.
            </p>

            <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
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

            <dl className="mt-3.5 grid gap-3 sm:grid-cols-4">
              {[
                ["Caso", REPORT.caseId],
                ["Tipo de evento", REPORT.eventType],
                ["Protocolo aplicado", REPORT.protocol],
                ["Estado", REPORT.status],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-line bg-panel px-4 py-3">
                  <dt className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
                    {k}
                  </dt>
                  <dd className="mt-1.5 text-[14.5px] leading-snug font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            {avanzar}
          </div>
        </section>
      )}

      {/* ══════════ ESCENAS 6 A 9 · EL SERVICIO DE TODOS LOS DÍAS ══════════ */}
      {isProduct && (
        <section className="flex min-h-[100dvh] flex-col">
          {header}

          <div className="mx-auto w-full max-w-[1100px] px-4 pb-10 sm:px-8">
            <ProductScene scene={scene as ProductSceneKey} />
            {avanzar}
          </div>
        </section>
      )}

      {/* ══════════ CIERRE ══════════ */}
      {scene === "cierre" && (
        <section className="flex min-h-[100dvh] flex-col">
          {header}

          <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col items-center justify-center px-4 pb-10 text-center sm:px-8">
            <Logo size="xl" />

            <h2 className="mt-10 max-w-[24ch] text-[clamp(22px,4.4vw,38px)] leading-[1.1] font-bold tracking-tight text-balance uppercase">
              Tecnología de vanguardia para tu <span className="text-goldhi">seguridad</span>
            </h2>

            <div className="mt-8 w-full rounded-2xl border border-gold/30 bg-golddim/25 p-7">
              <h3 className="max-w-[26ch] mx-auto text-[clamp(19px,3.2vw,28px)] leading-tight font-bold tracking-tight text-balance uppercase">
                Hacemos el relevamiento de tu edificio sin cargo
              </h3>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
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
                  Volver a ver la demo
                </button>
              </div>
            </div>

            <p className="mt-6 text-[12.5px] leading-relaxed text-muted">
              {BRAND.central} · {BRAND.phone} · {BRAND.email}
              {sello && " · Simulación demostrativa"}
            </p>
          </div>
        </section>
      )}

      {/* Sin gesto previo el navegador bloquea el audio: se ofrece activarlo */}
      {isBeat && !audioUnlocked && (
        <button
          onClick={enableAudio}
          className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full border border-gold/50 bg-black/85 px-4 py-3 text-[13px] font-bold text-goldhi shadow-xl backdrop-blur"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
            <path d="M4 9v6h3.5L12 18.5v-13L7.5 9H4Z" />
            <path d="M16 9.5a3.5 3.5 0 0 1 0 5M18.5 7a7 7 0 0 1 0 10" />
          </svg>
          Activar sonido
        </button>
      )}

      {/* Progreso del modo automático, el del QR */}
      {auto && (
        <div className="fixed inset-x-0 top-0 z-50 flex items-center gap-3 bg-black/75 px-4 py-1.5 backdrop-blur-sm">
          <span className="rec-pulse h-1.5 w-1.5 rounded-full bg-gold" />
          <span className="text-[10px] font-semibold tracking-[0.16em] text-goldhi uppercase">
            Reproducción automática
          </span>
          {/* La misma numeración del encabezado: si acá dijera "4 / 11" y
              arriba "03 / 09", el vecino no sabe cuál mirar. */}
          <span className="ml-auto font-mono text-[10px] text-muted">
            Escena {SCENE_NUM[scene]} / 09
          </span>
        </div>
      )}
    </div>
  );
}
