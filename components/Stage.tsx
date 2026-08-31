"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export const STAGE_W = 1920;
export const STAGE_H = 1080;

/**
 * Escenario fijo de 1920x1080 escalado para llenar cualquier pantalla sin
 * deformarse. Garantiza que la demo se vea idéntica en el monitor del
 * vendedor, en el Zoom del consorcio y en el celular que escanea el QR.
 *
 * Mide el contenedor con ResizeObserver (y no window.innerWidth) para que la
 * escala siempre sea correcta, incluso si la ventana cambia de tamaño durante
 * la carga o se comparte pantalla a mitad de la reunión.
 */
export default function Stage({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setBox({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ready = box.w > 0 && box.h > 0;
  const scale = ready ? Math.min(box.w / STAGE_W, box.h / STAGE_H) : 0;
  const portrait = ready && box.h > box.w && box.w < 900;

  return (
    // `overflow: clip` (y no `hidden`) evita que el navegador pueda scrollear
    // el escenario al enfocar un botón: sin scroll container, no hay salto.
    <div
      ref={rootRef}
      className="fixed inset-0 flex items-center justify-center bg-black"
      style={{ overflow: "clip" }}
    >
      <div
        style={{
          width: STAGE_W * scale,
          height: STAGE_H * scale,
          overflow: "clip",
          flex: "0 0 auto",
          position: "relative",
          visibility: ready ? "visible" : "hidden",
        }}
      >
        <div
          style={{
            width: STAGE_W,
            height: STAGE_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>

      {portrait && (
        <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center px-4">
          <div className="flex items-center gap-2.5 rounded-full border border-gold/40 bg-black/85 px-4 py-2.5 text-[12px] font-medium text-goldhi backdrop-blur">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
              <path d="M10.5 19h3" />
            </svg>
            Girá el teléfono para ver la demo en pantalla completa
          </div>
        </div>
      )}
    </div>
  );
}
