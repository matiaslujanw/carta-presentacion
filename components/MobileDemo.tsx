"use client";

import { useEffect, useRef } from "react";
import CameraTile from "./CameraTile";
import Cam3Still from "./Cam3Still";
import DetectionOverlay from "./DetectionOverlay";
import Logo from "./Logo";
import {
  BRAND,
  CAMERAS,
  EVENT_CAMERA,
  EVENT_TIME,
  EVENT_TOWER,
  INTRUDER,
  OPERATOR_LOG,
  REPORT,
  RESPONSE_TARGET,
} from "@/lib/config";
import type { DemoMachine } from "@/lib/useDemoMachine";

/* ── Onda de audio, en chico. Determinista para no romper la hidratación ── */
const BARS = Array.from({ length: 22 }, (_, i) => ({
  h: 0.22 + 0.78 * Math.abs(Math.sin(i * 1.37) * Math.cos(i * 0.61)),
  d: (i % 7) * 0.09,
}));

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-11 items-center justify-between gap-[2px]">
      {BARS.map((b, i) => (
        <span
          key={i}
          className={active ? "wave-bar" : ""}
          style={{
            width: 4,
            height: `${(active ? b.h : 0.06) * 100}%`,
            minHeight: 3,
            borderRadius: 2,
            background: active
              ? "linear-gradient(to top, #c08f27, #f1cf6b)"
              : "rgba(255,255,255,0.13)",
            animationDelay: `${b.d}s`,
            animationDuration: `${0.52 + (i % 5) * 0.07}s`,
            transition: "height .3s ease",
          }}
        />
      ))}
    </div>
  );
}

function Field({ label, value, tone }: { label: string; value: string; tone?: "ok" | "alert" }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-2 last:border-0">
      <span className="shrink-0 text-[12px] text-muted">{label}</span>
      <span
        className={`text-right text-[12.5px] font-semibold ${
          tone === "ok" ? "text-ok" : tone === "alert" ? "text-alert" : "text-ink"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Recorrido vertical para celular. Consume el mismo hook que la vista de
 * escritorio, así que los pasos, los tiempos y el video son idénticos: lo
 * único distinto es cómo se acomoda en pantalla.
 */
export default function MobileDemo({ m }: { m: DemoMachine }) {
  const {
    step,
    setStep,
    consorcio,
    auto,
    sello,
    clock,
    dateLabel,
    hintCam,
    eventCam,
    t,
    confidence,
    feed,
    intruderPhase,
    eventClips,
    baked,
    trackerLost,
    showBoxInProtocol,
    canClose,
    reset,
    download,
    onClipsFailed,
  } = m;

  const scrollRef = useRef<HTMLElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [step]);

  const logRef = useRef<HTMLDivElement>(null);
  const visibleLog = OPERATOR_LOG.filter((l) => t >= l.at);
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [visibleLog.length]);

  const overlay = (
    <DetectionOverlay
      phase={intruderPhase}
      showBox={step === "protocol" ? showBoxInProtocol : true}
      confidence={confidence}
      compact
      showFigure={!baked}
      box={baked ? INTRUDER.boxBaked : INTRUDER.box}
      lost={trackerLost}
    />
  );

  const feedCopy =
    feed === "alert"
      ? { text: `ALERTA DE IA — ${EVENT_TOWER}`, cls: "text-alert alert-text", dot: "bg-alert" }
      : feed === "protocol"
        ? { text: "PROTOCOLO DE DISUASIÓN EN CURSO", cls: "text-alert alert-text", dot: "bg-alert" }
        : feed === "cleared"
          ? { text: "Incidente cerrado — Perímetro despejado", cls: "text-goldhi", dot: "bg-gold" }
          : { text: "IA Operando — No se detectan anomalías", cls: "text-ok", dot: "bg-ok" };

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-void text-ink select-none">
      {/* ── Encabezado ── */}
      <header className="shrink-0 border-b border-line bg-panel">
        {auto && (
          <div className="flex items-center gap-2 bg-black/60 px-4 py-1">
            <span className="rec-pulse h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="text-[9px] font-semibold tracking-[0.16em] text-goldhi uppercase">
              Demostración automática
            </span>
            <span className="ml-auto font-mono text-[10px] text-muted">
              {{ panel: "1", alert: "2", protocol: "3", report: "4" }[step]} / 4
            </span>
          </div>
        )}
        <div className="flex items-center gap-3 px-4 pt-3">
          <Logo size="sm" />
          <div className="ml-auto text-right">
            <div className="font-mono text-[16px] leading-none font-bold tabular-nums">{clock}</div>
            <div className="mt-1 text-[9px] tracking-[0.14em] text-muted uppercase">
              {dateLabel || "—"}
            </div>
          </div>
        </div>
        <div className="px-4 pt-2 pb-3">
          <div className="flex items-center gap-2">
            <span className="truncate text-[15px] font-bold tracking-tight">
              Consorcio {consorcio}
            </span>
            <span className="shrink-0 rounded border border-gold/35 bg-golddim/40 px-1.5 py-0.5 text-[9px] font-semibold text-goldhi">
              Plan Tótem IA
            </span>
          </div>
          <div className="mt-0.5 truncate text-[11px] text-muted">
            San Miguel de Tucumán · 4 cámaras · 1 tótem · Monitoreo 24/7
          </div>
        </div>
      </header>

      {/* ── Cuerpo ── */}
      <main
        ref={scrollRef}
        className={`relative min-h-0 flex-1 overflow-y-auto overscroll-contain ${
          step === "panel" ? "flex flex-col justify-center" : ""
        }`}
      >
        {/* HOJA 1 · las cuatro cámaras */}
        {(step === "panel" || step === "report") && (
          <div className="grid grid-cols-2 gap-2 p-2">
            {CAMERAS.map((cam) => {
              const isEvent = cam.id === EVENT_CAMERA;
              return (
                <CameraTile
                  key={cam.id}
                  camera={cam}
                  clock={clock}
                  compact
                  state={step === "report" && isEvent ? "cleared" : "normal"}
                  clips={isEvent ? eventClips : undefined}
                  onClipsFailed={isEvent ? onClipsFailed : undefined}
                  hint={step === "panel" && isEvent && hintCam}
                  onClick={step === "panel" && isEvent ? () => setStep("alert") : undefined}
                  className="aspect-video rounded-md"
                />
              );
            })}
          </div>
        )}
        {step === "panel" && (
          <>
            <p className="px-4 pb-4 text-center text-[12.5px] text-muted">
              Tocá la <span className="font-semibold text-goldhi">Cam 03</span> para ver qué pasa
              cuando la IA detecta a alguien en el perímetro.
            </p>
            <div className="mx-2 mb-2 rounded-xl border border-line bg-elev p-4">
              <div className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
                Qué mira este panel
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-ink2">
                Las cuatro cámaras del consorcio y el tótem de la entrada, en una sola pantalla.
                La analítica marca sola lo que se sale de lo normal, pero{" "}
                <span className="font-semibold text-goldhi">
                  la decisión siempre la toma una persona
                </span>{" "}
                en la central. Por eso no hay falsas alarmas de madrugada.
              </p>
            </div>
          </>
        )}

        {/* HOJA 2 · la detección */}
        {step === "alert" && (
          <div className="p-2">
            <CameraTile
              camera={eventCam}
              clock={clock}
              state="alert"
              compact
              clips={eventClips}
              onClipsFailed={onClipsFailed}
              className="aspect-video w-full rounded-md"
            >
              {overlay}
            </CameraTile>
            <div className="alert-text mt-3 flex items-center gap-2 rounded-lg border border-alert/50 bg-alertdim px-3 py-2.5">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-alert" fill="currentColor">
                <path d="M12 2 1.5 21h21L12 2Zm0 6.5 6.1 11h-12.2L12 8.5ZM11 11v4.2h2V11h-2Zm0 5.4V18h2v-1.6h-2Z" />
              </svg>
              <span className="text-[13px] font-bold text-alert">
                DETECCIÓN DE INTRUSIÓN — {EVENT_TOWER} / PERÍMETRO LATERAL
              </span>
            </div>
            <p className="mt-3 px-1 text-[13px] leading-relaxed text-muted">
              La analítica detectó una persona merodeando la reja y la marcó sola, con{" "}
              <span className="font-semibold text-ink">98% de confianza</span>. Todavía no sonó
              ninguna sirena: primero verifica un operador.
            </p>
          </div>
        )}

        {/* HOJA 3 · protocolo y central humana */}
        {step === "protocol" && (
          <div className="p-2">
            <CameraTile
              camera={eventCam}
              clock={clock}
              state={t >= 5.6 ? "cleared" : "alert"}
              compact
              clips={eventClips}
              onClipsFailed={onClipsFailed}
              className="aspect-video w-full rounded-md"
            >
              {overlay}
            </CameraTile>

            <div
              className={`mt-3 rounded-xl border p-4 transition-colors duration-500 ${
                t >= RESPONSE_TARGET ? "border-ok/40 bg-ok/[0.07]" : "border-line bg-elev"
              }`}
            >
              <div className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
                Tiempo de respuesta
              </div>
              <div className="mt-1 flex items-end gap-2">
                <span
                  className={`font-mono text-[44px] leading-none font-bold tabular-nums ${
                    t >= RESPONSE_TARGET ? "text-ok" : "text-ink"
                  }`}
                >
                  {Math.min(t, RESPONSE_TARGET).toFixed(1)}
                </span>
                <span className="pb-1.5 text-[16px] font-semibold text-muted">segundos</span>
              </div>
              {t >= RESPONSE_TARGET && (
                <div className="fade-up mt-2 inline-flex items-center gap-1.5 rounded-full border border-ok/40 bg-ok/15 px-2.5 py-1 text-[11px] font-bold text-ok">
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                    <path d="M8.2 14.5 4 10.3l1.5-1.5 2.7 2.7 6.3-6.3L16 6.7z" />
                  </svg>
                  Operador humano en línea
                </div>
              )}
              <p className="mt-2 text-[12px] leading-relaxed text-muted">
                Desde la detección hasta que interviene una persona real. Sin sirenas automáticas.
              </p>
            </div>

            <div
              className={`mt-3 rounded-xl border p-4 transition-colors duration-500 ${
                t >= 2 ? "border-gold/40 bg-golddim/40" : "border-line bg-elev"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-[13px] font-bold ${t >= 2 ? "text-goldhi" : "text-faint"}`}
                >
                  {t >= 2 ? "Micrófono del Tótem Activo" : "Micrófono del Tótem — en espera"}
                </span>
                {t >= 3 && t < 5.4 && (
                  <span className="alert-text ml-auto rounded-full bg-alert px-2 py-0.5 text-[9px] font-bold tracking-widest text-white">
                    EN VIVO
                  </span>
                )}
              </div>
              <div className="mt-1 font-mono text-[11px] text-muted">
                {t >= 3 && t < 5.4
                  ? "Emitiendo audio disuasivo · 92 dB"
                  : t >= 2
                    ? "Canal abierto · listo para emitir"
                    : "Canal cerrado"}
              </div>
              <div className="mt-2 rounded-lg border border-line bg-black/45 px-2 py-1">
                <Waveform active={t >= 3 && t < 5.4} />
              </div>
            </div>

            <div className="mt-3">
              <div className="px-1 pb-2 text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
                Minuta del operador
              </div>
              <div ref={logRef} className="max-h-[220px] space-y-2 overflow-y-auto">
                {visibleLog.map((l, i) => (
                  <div
                    key={i}
                    className={`fade-up flex gap-2.5 rounded-lg border px-3 py-2 ${
                      l.kind === "quote"
                        ? "border-gold/35 bg-golddim/30"
                        : l.kind === "result"
                          ? "border-ok/30 bg-ok/[0.06]"
                          : "border-line bg-elev"
                    }`}
                  >
                    <span className="shrink-0 pt-0.5 font-mono text-[10px] text-faint tabular-nums">
                      +{l.at.toFixed(1)}s
                    </span>
                    <span
                      className={`text-[12.5px] leading-relaxed ${
                        l.kind === "quote"
                          ? "font-semibold text-goldhi italic"
                          : l.kind === "result"
                            ? "text-ok"
                            : "text-ink2"
                      }`}
                    >
                      {l.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HOJA 4 · reporte al administrador */}
        {step === "report" && (
          <div className="absolute inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-[3px]">
            <div className="pop-in mx-2 my-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-line2 bg-panel">
              <div className="flex shrink-0 items-center gap-2 border-b border-line bg-elev px-4 py-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                <span className="text-[11px] font-semibold text-ink">
                  Reporte automático enviado
                </span>
                <span className="ml-auto font-mono text-[10px] text-muted">{dateLabel} 03:19</span>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                <div className="flex items-start justify-between gap-3 border-b border-line pb-3">
                  <Logo size="sm" />
                  <div className="text-right">
                    <div className="font-mono text-[12px] font-bold text-goldhi">
                      {REPORT.caseId}
                    </div>
                    <div className="font-mono text-[10px] text-muted">
                      {dateLabel} — {EVENT_TIME} AM
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-ok/35 bg-ok/[0.08] px-3 py-2.5">
                  <div className="text-[13px] font-bold text-ok">{REPORT.status}</div>
                  <div className="text-[11.5px] text-muted">
                    Sin intervención policial. Sin costo adicional para el consorcio.
                  </div>
                </div>

                <div className="mt-3 font-mono text-[11px]">
                  <span className="text-faint">Para: </span>
                  <span className="text-ink2">Administración — {consorcio}</span>
                </div>

                <div className="mt-2">
                  <Field label="Sector" value={`${EVENT_TOWER} · Cám. 03`} />
                  <Field label="Tipo de evento" value={REPORT.eventType} tone="alert" />
                  <Field label="Detección" value="Analítica Vig.IA · 98%" />
                  <Field label="Respuesta" value={`${RESPONSE_TARGET} segundos`} tone="ok" />
                  <Field label="Protocolo" value={REPORT.protocol} />
                  <Field label="Clasificación" value={REPORT.classification} tone="ok" />
                </div>

                <div className="mt-4 space-y-3">
                  <div className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
                    2 capturas adjuntas
                  </div>
                  <figure className="overflow-hidden rounded-lg border border-line bg-black">
                    <Cam3Still uid="mob-a" kind="intruder" time={`${EVENT_TIME}:22`} />
                    <figcaption className="border-t border-line bg-elev px-2.5 py-1.5 text-[11px] text-muted">
                      03:14:22 — Intruso detectado por la IA.
                    </figcaption>
                  </figure>
                  <figure className="overflow-hidden rounded-lg border border-line bg-black">
                    <Cam3Still uid="mob-b" kind="clear" time="03:14:31" />
                    <figcaption className="border-t border-line bg-elev px-2.5 py-1.5 text-[11px] text-muted">
                      03:14:31 — Perímetro despejado tras el aviso.
                    </figcaption>
                  </figure>
                </div>

                <p className="mt-4 border-t border-line pt-3 text-[11.5px] leading-relaxed text-muted">
                  Este reporte se envía solo al administrador ante cada evento, con la evidencia y
                  la minuta completa del operador. {BRAND.phone}
                </p>
              </div>

              <div className="flex shrink-0 gap-2 border-t border-line bg-elev px-3 py-3">
                <button
                  onClick={download}
                  className="rounded-lg border border-line2 px-3 py-3 text-[12.5px] font-semibold text-ink2"
                >
                  PDF
                </button>
                <button
                  onClick={reset}
                  className="flex-1 rounded-lg bg-gold px-4 py-3 text-[14px] font-bold text-black"
                >
                  Finalizar Demostración
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Pie: estado del sistema y la acción de la hoja ── */}
      <footer className="shrink-0 border-t border-line bg-panel">
        <div
          className={`flex items-center gap-2 px-4 py-2 ${
            feed === "alert" || feed === "protocol" ? "bg-alertdim" : ""
          }`}
        >
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${feedCopy.dot}`} />
          <span className={`truncate text-[12px] font-semibold ${feedCopy.cls}`}>
            {feedCopy.text}
          </span>
          {sello && (
            <span className="ml-auto shrink-0 font-mono text-[8.5px] tracking-[0.12em] text-white/35 uppercase">
              Simulación
            </span>
          )}
        </div>

        {step === "alert" && (
          <div className="px-3 pt-1 pb-3">
            <button
              onClick={() => setStep("protocol")}
              className="cta-glow flex w-full items-center justify-center gap-2 rounded-xl bg-cta px-4 py-4 text-[15px] font-bold text-white"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
              >
                <path d="M3 11v2a1 1 0 0 0 1 1h2.5l4.5 3.5v-13L6.5 8H4a1 1 0 0 0-1 1Z" />
                <path d="M16 8.5a4.5 4.5 0 0 1 0 7M18.5 5.5a8 8 0 0 1 0 13" />
              </svg>
              Iniciar Protocolo de Disuasión
            </button>
          </div>
        )}

        {step === "protocol" && (
          <div className="px-3 pt-1 pb-3">
            <button
              onClick={() => setStep("report")}
              disabled={!canClose}
              className={`w-full rounded-xl px-4 py-4 text-[15px] font-bold transition-all duration-300 ${
                canClose ? "ok-glow bg-ok text-white" : "bg-elev2 text-faint"
              }`}
            >
              {canClose ? "Cerrar Incidente — Amenaza Neutralizada" : "Protocolo en curso…"}
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
