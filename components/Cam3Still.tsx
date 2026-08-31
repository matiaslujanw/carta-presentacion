"use client";

import { useCallback, useState } from "react";
import { PerimetroScene, IntruderSilhouette } from "./CameraScenes";
import { CAMERAS, GRADE, INTRUDER, SNAPSHOT_FRAMES } from "@/lib/config";

const CAM3 = CAMERAS.find((c) => c.id === 3)!;

export type SnapshotKind = keyof typeof SNAPSHOT_FRAMES;

/**
 * Captura fija de la Cam 03 para los adjuntos del reporte.
 *
 * Orden de preferencia:
 *  1. Una imagen propia, si se seteó `still` en SNAPSHOT_FRAMES.
 *  2. Un frame congelado del propio clip de video (se busca el segundo indicado
 *     y se deja el video pausado ahí). Así la captura del reporte siempre
 *     coincide con el material real, sin generar ningún archivo aparte.
 *  3. La foto cam3.jpg.
 *  4. La escena vectorial de respaldo.
 */
export default function Cam3Still({
  uid,
  kind,
  time,
  print = false,
}: {
  uid: string;
  kind: SnapshotKind;
  time: string;
  /** true = versión para impresión (sin clases de Tailwind ni animación) */
  print?: boolean;
}) {
  const frame = SNAPSHOT_FRAMES[kind];
  const withIntruder = kind === "intruder";

  const [clipFailed, setClipFailed] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [figFailed, setFigFailed] = useState(false);

  const useStill = Boolean(frame.still);
  const useClip = !useStill && Boolean(frame.clip) && !clipFailed;
  const useImg = !useStill && !useClip && Boolean(CAM3.image) && !imgFailed;
  const useScene = !useStill && !useClip && !useImg;

  // Con la persona grabada en el video no hace falta dibujar la silueta.
  const drawFigure = withIntruder && !useClip;
  const box = useClip ? INTRUDER.boxBaked : INTRUDER.box;

  const seek = useCallback(
    (el: HTMLVideoElement | null) => {
      if (el && el.currentTime === 0) el.currentTime = frame.at;
    },
    [frame.at],
  );

  const media: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    filter: GRADE[CAM3.grade ?? "ir"],
  };

  return (
    <div style={{ position: "relative", aspectRatio: "16 / 9", background: "#000", overflow: "hidden" }}>
      {useStill ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={frame.still} alt="" style={media} />
      ) : useClip ? (
        <video
          src={frame.clip}
          muted
          playsInline
          preload="auto"
          aria-hidden
          onLoadedData={(e) => seek(e.currentTarget)}
          onError={() => setClipFailed(true)}
          style={media}
        />
      ) : useImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={CAM3.image} alt="" onError={() => setImgFailed(true)} style={media} />
      ) : (
        <div style={{ position: "absolute", inset: 0 }}>
          <PerimetroScene uid={uid} />
        </div>
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(120,190,150,0.14)",
          mixBlendMode: useScene ? "color" : "overlay",
          pointerEvents: "none",
        }}
      />

      {withIntruder && (
        <>
          {drawFigure && (
            <div
              style={{
                position: "absolute",
                left: `${INTRUDER.figure.left}%`,
                top: `${INTRUDER.figure.top}%`,
                width: `${INTRUDER.figure.width}%`,
                height: `${INTRUDER.figure.height}%`,
              }}
            >
              {INTRUDER.image && !figFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={INTRUDER.image}
                  alt=""
                  onError={() => setFigFailed(true)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "bottom",
                    filter: "brightness(0.35) contrast(1.3)",
                  }}
                />
              ) : (
                <IntruderSilhouette />
              )}
            </div>
          )}
          <div
            style={{
              position: "absolute",
              left: `${box.left}%`,
              top: `${box.top}%`,
              width: `${box.width}%`,
              height: `${box.height}%`,
              boxShadow: print
                ? "inset 0 0 0 2px #ff3535"
                : "inset 0 0 0 2px #ff3535, 0 0 14px rgba(255,53,53,0.4)",
            }}
          >
            {!print && (
              <span className="absolute -top-[18px] left-0 rounded-sm bg-alert px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap text-white">
                Intruso 98%
              </span>
            )}
          </div>
        </>
      )}

      {!print && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between p-1.5 font-mono text-[9px] text-ink/80">
          <span>CAM 03 · PERÍMETRO</span>
          <span>{time}</span>
        </div>
      )}
    </div>
  );
}
