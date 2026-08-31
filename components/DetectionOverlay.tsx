"use client";

import { useState } from "react";
import { IntruderSilhouette } from "./CameraScenes";
import { DETECTION, INTRUDER } from "@/lib/config";

export type IntruderPhase = "lurking" | "fleeing" | "gone";

/**
 * Capa de IA sobre la Cam 03: el sospechoso y el bounding box que la analítica
 * dibuja sobre el objetivo.
 *
 * La posición sale de INTRUDER en lib/config.ts (en % del cuadro), así se
 * recalibra sin tocar este archivo cuando cambia la foto de la reja.
 */
const FIGURE = INTRUDER.figure;

/** Usa el PNG recortado si existe; si no, la silueta vectorial */
function Figure() {
  const [failed, setFailed] = useState(false);
  if (!INTRUDER.image || failed) return <IntruderSilhouette />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={INTRUDER.image}
      alt=""
      onError={() => setFailed(true)}
      className="h-full w-full object-contain object-bottom"
      style={{ filter: "brightness(0.35) contrast(1.3)" }}
    />
  );
}

export default function DetectionOverlay({
  phase,
  showBox,
  confidence,
  compact = false,
  showFigure = true,
  box,
  lost = false,
}: {
  phase: IntruderPhase;
  showBox: boolean;
  confidence: number;
  compact?: boolean;
  /**
   * false cuando la persona ya viene grabada dentro del video de la cámara:
   * la demo no dibuja ninguna silueta, sólo el recuadro de la IA.
   */
  showFigure?: boolean;
  /** Rectángulo del bounding box, en % del cuadro */
  box?: { left: number; top: number; width: number; height: number };
  /**
   * El tracker perdió el objetivo. Con la persona grabada en el video no se la
   * puede seguir cuando escapa, así que el sistema lo declara: es lo que hace
   * un equipo real, y se lee mejor que un recuadro que flota solo.
   */
  lost?: boolean;
}) {
  const BOX = box ?? INTRUDER.box;

  if (lost) {
    // Centrado en el cuadro y no sobre el bounding box: el objetivo ya no está
    // en ningún lado, y anclarlo a la última posición se desbordaba del panel.
    return (
      <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
        <span
          className={`fade-up mt-[12%] rounded-sm border border-alert/70 bg-black/85 text-center font-mono font-bold tracking-wider text-alert ${
            compact ? "px-2 py-1 text-[10px]" : "px-2.5 py-1.5 text-[13px]"
          }`}
        >
          SEGUIMIENTO PERDIDO
          {!compact && " — OBJETIVO FUERA DE CUADRO"}
        </span>
      </div>
    );
  }

  if (phase === "gone") return null;

  // Con la persona grabada en el video, el recuadro no puede moverse por su
  // cuenta: se queda quieto sobre el objetivo, como un tracker real.
  const motion = !showFigure ? "" : phase === "fleeing" ? "intruder-flee" : "intruder-climb";

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* ── Silueta (sólo si la persona no viene en el video) ── */}
      {showFigure && (
        <div
          className={`absolute ${motion}`}
          style={{
            left: `${FIGURE.left}%`,
            top: `${FIGURE.top}%`,
            width: `${FIGURE.width}%`,
            height: `${FIGURE.height}%`,
          }}
        >
          <Figure />
        </div>
      )}

      {/* ── Bounding box ── */}
      {showBox && (
        <div
          className={`absolute ${motion}`}
          style={{
            left: `${BOX.left}%`,
            top: `${BOX.top}%`,
            width: `${BOX.width}%`,
            height: `${BOX.height}%`,
          }}
        >
          <div className="lock-on relative h-full w-full">
            {/* Recuadro */}
            <div
              className="box-breathe absolute inset-0"
              style={{
                boxShadow: "inset 0 0 0 2px #ff3535, 0 0 22px rgba(255,53,53,0.45)",
              }}
            />
            {/* Esquinas reforzadas */}
            {(
              [
                ["top-0 left-0", "border-t-[3px] border-l-[3px]"],
                ["top-0 right-0", "border-t-[3px] border-r-[3px]"],
                ["bottom-0 left-0", "border-b-[3px] border-l-[3px]"],
                ["bottom-0 right-0", "border-b-[3px] border-r-[3px]"],
              ] as const
            ).map(([pos, border], i) => (
              <span
                key={i}
                className={`absolute ${pos} ${border} border-alert`}
                style={{ width: compact ? 10 : 20, height: compact ? 10 : 20 }}
              />
            ))}

            {/* Etiqueta flotante de la IA */}
            <div
              className="absolute left-0 whitespace-nowrap"
              style={{ bottom: "100%", marginBottom: compact ? 4 : 8 }}
            >
              <div
                className="flex items-stretch overflow-hidden rounded-[3px] shadow-lg"
                style={{ boxShadow: "0 4px 18px rgba(0,0,0,0.7)" }}
              >
                <span
                  className={`bg-alert font-bold tracking-wide text-white ${
                    compact ? "px-1.5 py-[3px] text-[9px]" : "px-2.5 py-1.5 text-[15px]"
                  }`}
                >
                  {DETECTION.label}
                </span>
                <span
                  className={`bg-black/85 font-mono font-semibold text-alert tabular-nums ${
                    compact ? "px-1.5 py-[3px] text-[9px]" : "px-2.5 py-1.5 text-[15px]"
                  }`}
                >
                  Confianza {Math.round(confidence)}%
                </span>
              </div>
              {!compact && (
                <div className="mt-1 flex gap-1.5 font-mono text-[11px]">
                  <span className="rounded-sm bg-black/80 px-1.5 py-0.5 text-ink/85">
                    CLASE: {DETECTION.classId}
                  </span>
                  <span className="rounded-sm bg-black/80 px-1.5 py-0.5 text-ink/85">
                    TRACK ID 0472
                  </span>
                  <span className="rounded-sm bg-black/80 px-1.5 py-0.5 text-goldhi">
                    {DETECTION.secondary}
                  </span>
                </div>
              )}
            </div>

            {/* Mira de seguimiento */}
            {!compact && (
              <>
                <div className="absolute top-1/2 left-1/2 h-[1px] w-6 -translate-x-1/2 bg-alert/60" />
                <div className="absolute top-1/2 left-1/2 h-6 w-[1px] -translate-y-1/2 bg-alert/60" />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
