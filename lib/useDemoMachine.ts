"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Clip } from "@/components/CameraTile";
import type { IntruderPhase } from "@/components/DetectionOverlay";
import type { FeedState } from "@/components/StatusBar";
import {
  AUTOPLAY_MS,
  CAMERAS,
  DEFAULT_CONSORCIO,
  DETECTION,
  EVENT_CAMERA,
  EVENT_TAKE,
  INTRUDER,
} from "@/lib/config";

export type Step = "panel" | "alert" | "protocol" | "report";

/** Segundo del protocolo en el que el sospechoso empieza a retirarse */
export const FLEE_AT = 5;

/** Reloj simulado: la demo ocurre a las 03:14 AM (merodeo nocturno) */
const CLOCK_BASE_S = 3 * 3600 + 13 * 60 + 58;
const fmt = (s: number) => {
  const t = Math.floor(s) % 86400;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(t / 3600))}:${p(Math.floor((t % 3600) / 60))}:${p(t % 60)}`;
};

/**
 * Toda la lógica de la demo en un solo lugar: pasos, reloj, cronómetro del
 * protocolo, tramos de video y estado del recuadro de la IA.
 *
 * Las vistas de escritorio y de celular consumen este mismo hook, así que el
 * recorrido y los tiempos son idénticos en las dos y no se pueden desincronizar.
 */
export function useDemoMachine() {
  const [step, setStep] = useState<Step>("panel");
  const [consorcio, setConsorcio] = useState(DEFAULT_CONSORCIO);
  const [auto, setAuto] = useState(false);
  const [sello, setSello] = useState(true);
  const [clockS, setClockS] = useState(CLOCK_BASE_S);
  const [confidence, setConfidence] = useState<number>(DETECTION.confidenceStart);
  const [t, setT] = useState(0); // segundos dentro del protocolo
  const [dateLabel, setDateLabel] = useState("");
  const [hintCam, setHintCam] = useState(false);
  // "pending" hasta saber si los videos de la Cam 03 están en public/cams/
  const [clipProbe, setClipProbe] = useState<"pending" | "ok" | "none">("pending");

  const eventCam = useMemo(() => CAMERAS.find((c) => c.id === EVENT_CAMERA)!, []);
  const otherCams = useMemo(() => CAMERAS.filter((c) => c.id !== EVENT_CAMERA), []);

  /* ── Parámetros de URL: ?consorcio= · ?modo=auto · ?sello=off ── */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const c = q.get("consorcio");
    if (c) setConsorcio(c.slice(0, 60));
    setAuto(q.get("modo") === "auto");
    setSello(q.get("sello") !== "off");
    setDateLabel(
      new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date()),
    );
  }, []);

  /* ── ¿Está el material de video de la Cam 03 en public/cams/? ──
     Se sondea con un elemento suelto en vez de uno en el JSX: si el archivo ya
     está en caché, el navegador dispara loadedmetadata antes de que React
     alcance a enganchar el handler, y el sondeo quedaba colgado en "pending". */
  useEffect(() => {
    if (INTRUDER.mode === "overlay") {
      setClipProbe("none");
      return;
    }
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    const ok = () => setClipProbe("ok");
    const bad = () => setClipProbe("none");
    v.addEventListener("loadedmetadata", ok, { once: true });
    v.addEventListener("error", bad, { once: true });
    v.src = EVENT_TAKE.src;
    if (v.readyState >= 1) ok();
    return () => {
      v.removeEventListener("loadedmetadata", ok);
      v.removeEventListener("error", bad);
      v.removeAttribute("src");
    };
  }, []);

  /* ── Reloj ── */
  useEffect(() => {
    const id = setInterval(() => setClockS((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  /* ── Confianza subiendo durante el lock-on ── */
  useEffect(() => {
    if (step !== "alert" && step !== "protocol") return;
    if (step === "protocol") {
      setConfidence(DETECTION.confidence);
      return;
    }
    setConfidence(DETECTION.confidenceStart);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1200);
      const eased = 1 - Math.pow(1 - p, 3);
      setConfidence(
        DETECTION.confidenceStart + (DETECTION.confidence - DETECTION.confidenceStart) * eased,
      );
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step]);

  /* ── Cronómetro del protocolo ── */
  useEffect(() => {
    if (step !== "protocol") {
      setT(0);
      return;
    }
    const start = performance.now();
    const id = setInterval(() => setT((performance.now() - start) / 1000), 100);
    return () => clearInterval(id);
  }, [step]);

  /* ── Pista visual sobre la Cam 03 para guiar el clic del vendedor ── */
  useEffect(() => {
    if (step !== "panel") {
      setHintCam(false);
      return;
    }
    const id = setTimeout(() => setHintCam(true), 2600);
    return () => clearTimeout(id);
  }, [step]);

  const reset = useCallback(() => {
    setStep("panel");
    setClockS(CLOCK_BASE_S);
  }, []);

  /* ── Modo auto-play (para el QR): avanza solo y vuelve a empezar ── */
  useEffect(() => {
    if (!auto) return;
    const next: Record<Step, Step> = {
      panel: "alert",
      alert: "protocol",
      protocol: "report",
      report: "panel",
    };
    const id = setTimeout(() => {
      if (step === "report") reset();
      else setStep(next[step]);
    }, AUTOPLAY_MS[step]);
    return () => clearTimeout(id);
  }, [auto, step, reset]);

  const download = useCallback(() => window.print(), []);

  const clock = fmt(clockS);
  const feed: FeedState =
    step === "alert" ? "alert" : step === "protocol" ? "protocol" : step === "report" ? "cleared" : "idle";

  const intruderPhase: IntruderPhase =
    step === "protocol" ? (t >= FLEE_AT ? "fleeing" : "lurking") : "lurking";

  /* ── Video de la Cam 03 ──
     Si los tres clips están, se usan y la persona viene grabada en el video
     ("baked"): la demo no dibuja ninguna silueta, sólo el recuadro de la IA.
     Si no están, sigue funcionando exactamente como antes. */
  const useClips = clipProbe === "ok";
  const baked = useClips && INTRUDER.mode !== "overlay";

  const activeClip: "idle" | "intruder" | "flee" =
    step === "alert"
      ? "intruder"
      : step === "protocol"
        ? t >= FLEE_AT
          ? "flee"
          : "intruder"
        : "idle";

  // Los tres estados son tramos de la misma toma continua: mismo encuadre,
  // misma luz, sin salto posible entre pantallas.
  const eventClips: Clip[] | undefined = useClips
    ? [
        { src: EVENT_TAKE.src, active: activeClip === "idle", ...EVENT_TAKE.idle },
        { src: EVENT_TAKE.src, active: activeClip === "intruder", ...EVENT_TAKE.intruder },
        { src: EVENT_TAKE.src, active: activeClip === "flee", loop: false, ...EVENT_TAKE.flee },
      ]
    : undefined;

  // Con la persona grabada, el tracker la pierde cuando sale de cuadro.
  const lostAt = FLEE_AT + INTRUDER.lostAfter;
  const trackerLost = baked && step === "protocol" && t >= lostAt && t < lostAt + 2.6;
  const showBoxInProtocol = baked ? t < lostAt : t < 6.6;


  return {
    step,
    setStep,
    consorcio,
    auto,
    sello,
    clock,
    dateLabel,
    hintCam,
    eventCam,
    otherCams,
    t,
    confidence,
    feed,
    intruderPhase,
    eventClips,
    baked,
    trackerLost,
    showBoxInProtocol,
    canClose: t >= 5.4,
    reset,
    download,
    onClipsFailed: () => setClipProbe("none"),
  };
}

export type DemoMachine = ReturnType<typeof useDemoMachine>;
