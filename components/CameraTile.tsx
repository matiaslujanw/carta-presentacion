"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { GRADE, type Camera } from "@/lib/config";
import { SCENES } from "./CameraScenes";

/** Un clip del stack de video de una cámara */
export type Clip = {
  src: string;
  /** true = es el clip que se está viendo ahora */
  active: boolean;
  /** false para tramos que terminan y quedan congelados en el último frame */
  loop?: boolean;
  /** Tramo del archivo, en segundos. Permite sacar varios estados de una sola toma */
  start?: number;
  end?: number;
};

/**
 * Con object-cover la imagen se recorta distinto según la forma del panel, así
 * que un porcentaje sobre el tile NO es un porcentaje sobre el video. Esto
 * calcula el rectángulo que la imagen ocupa de verdad, para que la capa de IA
 * (el bounding box) trabaje siempre en coordenadas del video y caiga sobre la
 * persona en cualquier pantalla.
 */
function useCoverRect(
  ref: React.RefObject<HTMLDivElement | null>,
  aspect: number,
  zoom: number,
) {
  const [rect, setRect] = useState<{
    l: number;
    t: number;
    w: number;
    h: number;
    W: number;
  } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const W = e.contentRect.width;
      const H = e.contentRect.height;
      if (!W || !H) return;
      let w: number, h: number;
      if (W / H > aspect) {
        w = W;
        h = W / aspect;
      } else {
        h = H;
        w = H * aspect;
      }
      w *= zoom;
      h *= zoom;
      setRect({ l: (W - w) / 2, t: (H - h) / 2, w, h, W });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, aspect, zoom]);
  return rect;
}

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
  const zoom = camera.zoom ?? 1;
  const rootRef = useRef<HTMLDivElement>(null);
  const cover = useCoverRect(rootRef, 16 / 9, zoom);
  // En un celular el mismo tile "compacto" mide 160 px en vez de 800: sin esto
  // el rótulo se come la imagen. Por debajo de 300 px se deja sólo lo esencial.
  const narrow = (cover?.W ?? 9999) < 300;

  return (
    <div
      ref={rootRef}
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
          style={{
            filter: hasStack || useMedia ? grade : undefined,
            transform: zoom !== 1 ? `scale(${zoom})` : undefined,
          }}
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
              style={{ objectPosition: camera.focus }}
              className="h-full w-full object-cover"
            />
          ) : useMedia ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={camera.image}
              alt=""
              onError={() => setMediaFailed(true)}
              style={{ objectPosition: camera.focus }}
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

      {/* ── Overlays de IA, en coordenadas del video ── */}
      {children && (
        <div
          className="pointer-events-none absolute"
          style={
            cover
              ? { left: cover.l, top: cover.t, width: cover.w, height: cover.h }
              : { inset: 0 }
          }
        >
          {children}
        </div>
      )}

      {/* ── Chrome del feed ── */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
        <div className="flex items-start justify-between p-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`font-mono font-semibold tracking-[0.14em] text-ink/95 ${
                narrow ? "text-[9px]" : compact ? "text-[11px]" : "text-[15px]"
              }`}
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
            >
              {camera.label}
            </span>
            {!narrow && (
              <span
                className={`tracking-[0.1em] text-ink/60 uppercase ${
                  compact ? "text-[9px]" : "text-[12px]"
                }`}
                style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
              >
                {camera.zone}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`rec-pulse rounded-full bg-alert ${
                narrow ? "h-1 w-1" : compact ? "h-1.5 w-1.5" : "h-2 w-2"
              }`}
            />
            <span
              className={`font-mono tracking-[0.12em] text-ink/80 ${
                narrow ? "text-[8px]" : compact ? "text-[9px]" : "text-[11px]"
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
            {narrow ? (camera.ir ? "IR ON" : "") : camera.ir ? "IR ON · 1080p · 25 fps" : "1080p · 25 fps"}
          </span>
          <span
            className={`font-mono tabular-nums text-ink/90 ${
              narrow ? "text-[9px]" : compact ? "text-[10px]" : "text-[13px]"
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
            <span
              className={`hint-pulse rounded-full border border-gold/60 bg-black/75 font-medium tracking-wide text-goldhi backdrop-blur-sm ${
                narrow ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-[11px]"
              }`}
            >
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
    const cancels: (() => void)[] = [];

    clips.forEach((c, i) => {
      const v = refs.current[i];
      if (!v) return;

      if (!c.active) {
        v.pause();
        return;
      }

      const start = c.start ?? 0;
      const end = c.end;
      const loops = c.loop !== false;

      const rewind = () => {
        try {
          v.currentTime = start;
        } catch {
          /* todavía sin metadatos: lo reintenta el handler de loadedmetadata */
        }
      };

      // Si el tramo no arrancó donde corresponde, lo acomoda
      if (v.readyState >= 1) {
        if (end === undefined || v.currentTime < start || v.currentTime > end) rewind();
      } else {
        v.addEventListener("loadedmetadata", rewind, { once: true });
      }

      // Corte del tramo. requestVideoFrameCallback da precisión de cuadro;
      // timeupdate (4 veces por segundo) se pasaría de largo y dejaría ver
      // un pedazo del tramo siguiente.
      if (end !== undefined) {
        const vAny = v as HTMLVideoElement & {
          requestVideoFrameCallback?: (cb: () => void) => number;
          cancelVideoFrameCallback?: (h: number) => void;
        };
        if (typeof vAny.requestVideoFrameCallback === "function") {
          let handle = 0;
          let alive = true;
          const tick = () => {
            if (!alive) return;
            if (v.currentTime >= end) {
              if (loops) rewind();
              else v.pause();
            }
            handle = vAny.requestVideoFrameCallback!(tick);
          };
          handle = vAny.requestVideoFrameCallback!(tick);
          cancels.push(() => {
            alive = false;
            vAny.cancelVideoFrameCallback?.(handle);
          });
        } else {
          const onTime = () => {
            if (v.currentTime >= end) {
              if (loops) rewind();
              else v.pause();
            }
          };
          v.addEventListener("timeupdate", onTime);
          cancels.push(() => v.removeEventListener("timeupdate", onTime));
        }
      }

      void v.play().catch(() => {});
    });

    return () => cancels.forEach((f) => f());
  }, [clips]);

  return (
    <>
      {clips.map((c, i) => (
        <video
          key={`${c.src}#${c.start ?? 0}`}
          ref={(el) => {
            refs.current[i] = el;
          }}
          src={c.src}
          muted
          playsInline
          preload="auto"
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
