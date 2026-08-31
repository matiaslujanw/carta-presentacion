"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { GRADE, type Camera } from "@/lib/config";
import { SCENES } from "./CameraScenes";

/** Un clip del stack de video de una cámara */
export type Clip = {
  src: string;
  /** true = es el clip que se está viendo ahora */
  active: boolean;
  /** false para clips que terminan y tienen que quedar congelados en el último frame */
  loop?: boolean;
};

/** Grano de sensor: se genera una vez y se reusa como background */
const GRAIN_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

type Props = {
  camera: Camera;
  /** Hora que se muestra en el overlay */
  clock: string;
  /** Estado visual del recuadro */
  state?: "normal" | "alert" | "cleared";
  /** Overlays de IA (bounding box, silueta) */
  children?: ReactNode;
  /** Tamaño del chrome: las tiles chicas usan texto más chico */
  compact?: boolean;
  onClick?: () => void;
  /** Sugerencia visual de que esta cámara es clickeable */
  hint?: boolean;
  className?: string;
  /**
   * Stack de clips para las cámaras que cambian de estado (la Cam 03).
   * Se montan y precargan los tres a la vez y se cruzan por opacidad, para que
   * el cambio de pantalla no muestre un frame negro. Si se pasa `clips`, se
   * ignoran camera.video y camera.image.
   */
  clips?: Clip[];
  /** Callback cuando ningún clip del stack pudo cargar */
  onClipsFailed?: () => void;
};

export default function CameraTile({
  camera,
  clock,
  state = "normal",
  children,
  compact = false,
  onClick,
  hint = false,
  className = "",
  clips,
  onClipsFailed,
}: Props) {
  const Scene = SCENES[camera.scene];
  const uid = `cam${camera.id}${compact ? "s" : "l"}`;
  const interactive = Boolean(onClick);

  // Si la foto o el video no existen todavía, se cae en la escena vectorial.
  const [mediaFailed, setMediaFailed] = useState(false);
  const [stackFailed, setStackFailed] = useState(false);
  const src = camera.video ?? camera.image;
  const hasStack = Boolean(clips && clips.length > 0) && !stackFailed;
  const useMedia = !hasStack && Boolean(src) && !mediaFailed;
  const grade = GRADE[camera.grade ?? (camera.ir ? "ir" : "night")];

  // El video real ya tiene movimiento propio: la deriva sólo se aplica a las
  // imágenes fijas y a las escenas de respaldo, para que no parezcan una foto.
  const drift = hasStack || camera.video ? "" : "feed-drift";

  return (
    <div
      onClick={onClick}
      role={interactive ? "button" : undefined}
      className={`group relative overflow-hidden bg-black ${
        interactive ? "cursor-pointer" : ""
      } ${className}`}
    >
      {/* ── Fuente de imagen ── */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute inset-0 ${drift}`}
          style={hasStack || useMedia ? { filter: grade } : undefined}
        >
          {hasStack ? (
            <ClipStack
              clips={clips!}
              onAllFailed={() => {
                setStackFailed(true);
                onClipsFailed?.();
              }}
            />
          ) : useMedia && camera.video ? (
            <video
              src={camera.video}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              disablePictureInPicture
              onError={() => setMediaFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : useMedia ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={camera.image}
              alt=""
              onError={() => setMediaFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <Scene uid={uid} />
          )}
        </div>
      </div>

      {/* ── Tratamiento de imagen: IR, grano, scanlines, viñeta ── */}
      {camera.ir && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "rgba(120,190,150,0.14)",
            mixBlendMode: hasStack || useMedia ? "overlay" : "color",
          }}
        />
      )}
      <div
        className="grain pointer-events-none absolute -inset-8 opacity-[0.055]"
        style={{ backgroundImage: GRAIN_URL }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.055) 0px, rgba(255,255,255,0.055) 1px, transparent 1px, transparent 3px)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="scan-sweep absolute inset-x-0 h-1/3"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(255,255,255,0.045), transparent)",
          }}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 44%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* ── Overlays de IA ── */}
      {children}

      {/* ── Chrome del feed ── */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
        <div className="flex items-start justify-between p-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`font-mono font-semibold tracking-[0.14em] text-ink/95 ${
                compact ? "text-[11px]" : "text-[15px]"
              }`}
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
            >
              {camera.label}
            </span>
            <span
              className={`tracking-[0.1em] text-ink/60 uppercase ${
                compact ? "text-[9px]" : "text-[12px]"
              }`}
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
            >
              {camera.zone}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`rec-pulse rounded-full bg-alert ${compact ? "h-1.5 w-1.5" : "h-2 w-2"}`}
            />
            <span
              className={`font-mono tracking-[0.12em] text-ink/80 ${
                compact ? "text-[9px]" : "text-[11px]"
              }`}
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
            >
              REC
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between p-2.5">
          <span
            className={`font-mono text-ink/75 ${compact ? "text-[9px]" : "text-[12px]"}`}
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
          >
            {camera.ir ? "IR ON · 1080p · 25 fps" : "1080p · 25 fps"}
          </span>
          <span
            className={`font-mono tabular-nums text-ink/90 ${
              compact ? "text-[10px]" : "text-[13px]"
            }`}
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
          >
            {clock}
          </span>
        </div>
      </div>

      {/* ── Marco según estado ── */}
      {state === "alert" ? (
        <div className="alert-frame pointer-events-none absolute inset-0" />
      ) : state === "cleared" ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: "inset 0 0 0 2px rgba(16,185,129,0.75)" }}
        />
      ) : (
        <div
          className="pointer-events-none absolute inset-0 transition-shadow duration-300"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.09)" }}
        />
      )}

      {/* ── Sugerencia de clic para el vendedor ── */}
      {hint && (
        <>
          <div
            className="hint-pulse pointer-events-none absolute inset-0"
            style={{ boxShadow: "inset 0 0 0 2px rgba(212,161,58,0.85)" }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-9">
            <span className="hint-pulse rounded-full border border-gold/60 bg-black/75 px-3 py-1 text-[11px] font-medium tracking-wide text-goldhi backdrop-blur-sm">
              Analizando movimiento…
            </span>
          </div>
        </>
      )}

      {interactive && (
        <div className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-200 group-hover:bg-white/[0.04]" />
      )}
    </div>
  );
}


/**
 * Stack de clips de una misma cámara. Los monta todos, mantiene reproduciendo
 * sólo el activo y cruza por opacidad. Sin frame negro entre pantallas y sin
 * gastar CPU decodificando lo que no se ve.
 */
function ClipStack({ clips, onAllFailed }: { clips: Clip[]; onAllFailed: () => void }) {
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (clips.length > 0 && clips.every((_, i) => failed[i])) onAllFailed();
  }, [failed, clips, onAllFailed]);

  useEffect(() => {
    clips.forEach((c, i) => {
      const v = refs.current[i];
      if (!v) return;
      if (c.active) {
        // Un clip que no loopea (la fuga) arranca siempre desde el principio
        if (c.loop === false && v.paused) v.currentTime = 0;
        void v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [clips]);

  return (
    <>
      {clips.map((c, i) => (
        <video
          key={c.src}
          ref={(el) => {
            refs.current[i] = el;
          }}
          src={c.src}
          muted
          playsInline
          preload="auto"
          loop={c.loop !== false}
          disablePictureInPicture
          onError={() => setFailed((f) => ({ ...f, [i]: true }))}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: c.active && !failed[i] ? 1 : 0,
            transition: "opacity 220ms linear",
          }}
        />
      ))}
    </>
  );
}
