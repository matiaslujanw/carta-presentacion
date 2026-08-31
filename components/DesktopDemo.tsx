"use client";

import CameraTile from "./CameraTile";
import DetectionOverlay, { type IntruderPhase } from "./DetectionOverlay";
import Sidebar from "./Sidebar";
import StatusBar from "./StatusBar";
import CentralPanel from "./CentralPanel";
import ReportModal from "./ReportModal";
import Stage from "./Stage";
import { CAMERAS, EVENT_CAMERA, EVENT_TOWER, INTRUDER } from "@/lib/config";
import type { DemoMachine } from "@/lib/useDemoMachine";

/** Vista de escritorio: el panel 1920x1080 escalado a la pantalla */
export default function DesktopDemo({ m }: { m: DemoMachine }) {
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
    otherCams,
    t,
    confidence,
    feed,
    intruderPhase,
    eventClips,
    baked,
    trackerLost,
    showBoxInProtocol,
    reset,
    download,
    onClipsFailed,
  } = m;

  const overlay = (compact: boolean, phase: IntruderPhase, showBox: boolean, lost = false) => (
    <DetectionOverlay
      phase={phase}
      showBox={showBox}
      confidence={confidence}
      compact={compact}
      showFigure={!baked}
      box={baked ? INTRUDER.boxBaked : INTRUDER.box}
      lost={lost}
    />
  );

  return (
    <>
      <div className="no-print">
      <Stage>
        <div className="relative flex h-full w-full bg-void text-ink select-none">
          <Sidebar
            active={step === "report" ? "reportes" : step === "panel" ? "monitoreo" : "alertas"}
            alertCount={step === "panel" ? 0 : 1}
          />

          <main className="flex min-w-0 flex-1 flex-col">
            {/* ── Barra superior ── */}
            <header className="flex h-[86px] shrink-0 items-center gap-6 border-b border-line bg-panel px-7">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <h1 className="truncate text-[23px] font-bold tracking-tight text-ink">
                    Consorcio {consorcio}
                  </h1>
                  <span className="shrink-0 rounded-md border border-gold/35 bg-golddim/40 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-goldhi">
                    Plan Tótem IA
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[13px] text-muted">
                  San Miguel de Tucumán · 4 cámaras · 1 tótem · Monitoreo 24/7
                </p>
              </div>

              <div className="ml-auto flex shrink-0 items-center gap-6">
                {/* Indicador de analítica: el "botón discreto" que parpadea */}
                <div
                  onClick={step === "panel" ? () => setStep("alert") : undefined}
                  className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2 ${
                    step === "panel"
                      ? "cursor-pointer border-gold/30 hover:bg-white/[0.04]"
                      : "border-alert/40 bg-alertdim"
                  }`}
                >
                  <span className="relative flex h-4 w-4 items-center justify-center">
                    <svg viewBox="0 0 20 20" className="absolute h-4 w-4">
                      <circle
                        cx="10"
                        cy="10"
                        r="8"
                        fill="none"
                        stroke={step === "panel" ? "rgba(212,161,58,0.35)" : "rgba(255,53,53,0.4)"}
                        strokeWidth="1.5"
                      />
                    </svg>
                    <span
                      className={`sweep-rot absolute h-4 w-4 ${step === "panel" ? "" : "alert-text"}`}
                      style={{
                        background: `conic-gradient(from 0deg, transparent 0deg, ${
                          step === "panel" ? "#d4a13a" : "#ff3535"
                        } 60deg, transparent 70deg)`,
                        borderRadius: "9999px",
                        maskImage: "radial-gradient(circle, transparent 45%, black 46%)",
                        WebkitMaskImage: "radial-gradient(circle, transparent 45%, black 46%)",
                      }}
                    />
                  </span>
                  <span
                    className={`text-[12.5px] font-semibold tracking-wide ${
                      step === "panel" ? "hint-pulse text-goldhi" : "alert-text text-alert"
                    }`}
                  >
                    {step === "panel" ? "Analítica IA — barrido perimetral" : `Evento activo · ${EVENT_TOWER}`}
                  </span>
                </div>

                <div className="text-right">
                  <div className="font-mono text-[26px] leading-none font-bold text-ink tabular-nums">
                    {clock}
                  </div>
                  <div className="mt-1 text-[11px] tracking-[0.14em] text-muted uppercase">
                    {dateLabel || "—"} · GMT-3
                  </div>
                </div>
              </div>
            </header>

            {/* ── Cuerpo ── */}
            <div className="relative min-h-0 flex-1">
              {/* PANTALLA 1 y 4 · grilla de 4 cámaras */}
              {(step === "panel" || step === "report") && (
                <div className="grid h-full grid-cols-2 grid-rows-2 gap-3 p-3">
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
                        className="rounded-lg"
                      />
                    );
                  })}
                </div>
              )}

              {/* PANTALLA 2 · la Cam 03 toma el centro con la detección */}
              {step === "alert" && (
                <div className="flex h-full gap-3 p-3">
                  <div className="relative min-w-0 flex-1">
                    <CameraTile
                      camera={eventCam}
                      clock={clock}
                      state="alert"
                      clips={eventClips}
                      onClipsFailed={onClipsFailed}
                      className="h-full rounded-lg"
                    >
                      {overlay(false, "lurking", true)}
                    </CameraTile>

                    {/* Banda de alerta sobre el video (abajo a la izquierda,
                        para no taparse con la etiqueta de la IA) */}
                    <div className="pointer-events-none absolute bottom-6 left-6">
                      <div className="alert-text fade-up flex items-center gap-3 rounded-lg border border-alert/60 bg-black/80 px-5 py-2.5 backdrop-blur-sm">
                        <svg viewBox="0 0 24 24" className="h-5 w-5 text-alert" fill="currentColor">
                          <path d="M12 2 1.5 21h21L12 2Zm0 6.5 6.1 11h-12.2L12 8.5ZM11 11v4.2h2V11h-2Zm0 5.4V18h2v-1.6h-2Z" />
                        </svg>
                        <span className="text-[17px] font-bold tracking-wide text-alert">
                          DETECCIÓN DE INTRUSIÓN — {EVENT_TOWER} / PERÍMETRO LATERAL
                        </span>
                      </div>
                    </div>

                    {/* CTA de la Pantalla 2 */}
                    <div className="absolute right-6 bottom-6">
                      <button
                        onClick={() => setStep("protocol")}
                        className="cta-glow flex cursor-pointer items-center gap-3 rounded-xl bg-cta px-7 py-4.5 text-[18px] font-bold text-white shadow-2xl transition-all hover:bg-ctahi"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                        >
                          <path d="M3 11v2a1 1 0 0 0 1 1h2.5l4.5 3.5v-13L6.5 8H4a1 1 0 0 0-1 1Z" />
                          <path d="M16 8.5a4.5 4.5 0 0 1 0 7M18.5 5.5a8 8 0 0 1 0 13" />
                        </svg>
                        Iniciar Protocolo de Disuasión Humana
                      </button>
                    </div>
                  </div>

                  {/* Tira lateral con el resto de las cámaras */}
                  <div className="flex w-[286px] shrink-0 flex-col gap-3">
                    {otherCams.map((cam) => (
                      <CameraTile
                        key={cam.id}
                        camera={cam}
                        clock={clock}
                        compact
                        className="flex-1 rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* PANTALLA 3 · cámara + central humana */}
              {step === "protocol" && (
                <div className="flex h-full">
                  <div className="flex min-w-0 flex-1 flex-col gap-3 p-3">
                    <CameraTile
                      camera={eventCam}
                      clock={clock}
                      state={t >= 5.6 ? "cleared" : "alert"}
                      clips={eventClips}
                      onClipsFailed={onClipsFailed}
                      className="aspect-video w-full shrink-0 rounded-lg"
                    >
                      {overlay(false, intruderPhase, showBoxInProtocol, trackerLost)}
                    </CameraTile>

                    {/* Línea de tiempo del evento */}
                    <div className="min-h-0 flex-1 rounded-lg border border-line bg-panel p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
                          Línea de tiempo del evento
                        </span>
                        <span className="font-mono text-[12px] text-faint">
                          Cám. 03 · {EVENT_TOWER} · Perímetro lateral
                        </span>
                      </div>
                      <div className="flex items-stretch gap-2">
                        {[
                          { at: 0, label: "Detección IA", sub: "Confianza 98%" },
                          { at: 1.2, label: "Verificación humana", sub: "Operador R. Medina" },
                          { at: 2, label: "Audio del tótem", sub: "Canal abierto" },
                          { at: 3, label: "Disuasión emitida", sub: "92 dB" },
                          { at: 5.2, label: "Perímetro despejado", sub: "Sospechoso se retira" },
                        ].map((s, i) => {
                          const done = t >= s.at;
                          return (
                            <div
                              key={i}
                              className={`flex-1 rounded-lg border px-3.5 py-3 transition-colors duration-500 ${
                                done ? "border-ok/35 bg-ok/[0.07]" : "border-line bg-elev"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                                    done ? "bg-ok text-black" : "bg-elev2 text-faint"
                                  }`}
                                >
                                  {done ? "✓" : i + 1}
                                </span>
                                <span
                                  className={`truncate text-[13px] font-semibold ${
                                    done ? "text-ink" : "text-faint"
                                  }`}
                                >
                                  {s.label}
                                </span>
                              </div>
                              <div className="mt-1.5 truncate font-mono text-[11px] text-muted">
                                +{s.at.toFixed(1)}s · {s.sub}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <CentralPanel
                    t={t}
                    consorcio={consorcio}
                    canClose={t >= 5.4}
                    onClose={() => setStep("report")}
                  />
                </div>
              )}

            </div>

            <StatusBar state={feed} clock={clock} sello={sello} />
          </main>

          {/* PANTALLA 4 · reporte al administrador, por encima de todo el panel */}
          {step === "report" && (
            <ReportModal
              consorcio={consorcio}
              dateLabel={dateLabel}
              onFinish={reset}
              onDownload={download}
            />
          )}

          {/* ── Progreso del modo automático ── */}
          {auto && (
            <div className="absolute top-0 right-0 left-0 z-40 flex items-center gap-3 bg-black/80 px-4 py-1.5">
              <span className="rec-pulse h-1.5 w-1.5 rounded-full bg-gold" />
              <span className="text-[11px] font-semibold tracking-[0.16em] text-goldhi uppercase">
                Demostración automática
              </span>
              <span className="ml-auto font-mono text-[11px] text-muted">
                {{ panel: "1", alert: "2", protocol: "3", report: "4" }[step]} / 4
              </span>
            </div>
          )}
        </div>
      </Stage>
      </div>

    </>
  );
}
