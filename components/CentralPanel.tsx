"use client";

import { useEffect, useRef } from "react";
import { BRAND, OPERATOR_LOG, RESPONSE_TARGET } from "@/lib/config";

/** Barras deterministas (sin Math.random, para no romper la hidratación) */
const BARS = Array.from({ length: 34 }, (_, i) => ({
  h: 0.22 + 0.78 * Math.abs(Math.sin(i * 1.37) * Math.cos(i * 0.61)),
  d: (i % 7) * 0.09,
}));

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-[74px] items-center justify-between gap-[3px] px-1">
      {BARS.map((b, i) => (
        <span
          key={i}
          className={active ? "wave-bar" : ""}
          style={{
            width: 5,
            height: `${(active ? b.h : 0.06) * 100}%`,
            minHeight: 3,
            borderRadius: 3,
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

export default function CentralPanel({
  t,
  consorcio,
  onClose,
  canClose,
}: {
  /** Segundos transcurridos desde el disparo del protocolo */
  t: number;
  consorcio: string;
  onClose: () => void;
  canClose: boolean;
}) {
  const responseTime = Math.min(t, RESPONSE_TARGET);
  const operatorOnline = t >= RESPONSE_TARGET;
  const micActive = t >= 2;
  const speaking = t >= 3 && t < 5.4;
  const visibleLog = OPERATOR_LOG.filter((l) => t >= l.at);

  // La minuta crece durante el protocolo: seguimos el último registro para que
  // nunca quede una línea cortada fuera de la vista.
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [visibleLog.length]);

  return (
    <div className="flex h-full w-[620px] shrink-0 flex-col border-l border-line bg-panel">
      {/* Encabezado */}
      <div className="shrink-0 border-b border-line bg-elev px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inset-0 rounded-full bg-alert" />
            <span className="rec-pulse absolute -inset-1.5 rounded-full bg-alert/30" />
          </span>
          <span className="text-[11px] font-bold tracking-[0.2em] text-alert uppercase">
            Protocolo activo
          </span>
        </div>
        <h2 className="mt-2 text-[22px] font-bold tracking-tight text-ink">
          Central de Monitoreo Humano
        </h2>
        <p className="mt-1 text-[13px] text-muted">
          {BRAND.central} · {consorcio}
        </p>
      </div>

      <div
        ref={bodyRef}
        className="flex-1 overflow-y-auto px-6 py-5"
        style={{ scrollbarWidth: "none" }}
      >
        {/* ── Tiempo de respuesta: la métrica que vende ── */}
        <div
          className={`rounded-xl border p-5 transition-colors duration-500 ${
            operatorOnline ? "border-ok/40 bg-ok/[0.07]" : "border-line bg-elev"
          }`}
        >
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
              Tiempo de respuesta
            </span>
            <span className="font-mono text-[11px] text-faint tabular-nums">
              Total del evento {t.toFixed(1)} s
            </span>
          </div>
          <div className="mt-2 flex items-end gap-3">
            <span
              className={`font-mono text-[62px] leading-none font-bold tabular-nums transition-colors duration-500 ${
                operatorOnline ? "text-ok" : "text-ink"
              }`}
            >
              {responseTime.toFixed(1)}
            </span>
            <span className="pb-2.5 text-[22px] font-semibold text-muted">segundos</span>
            {operatorOnline && (
              <span className="fade-up mb-3 ml-auto flex items-center gap-1.5 rounded-full border border-ok/40 bg-ok/15 px-3 py-1.5 text-[12px] font-bold text-ok">
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                  <path d="M8.2 14.5 4 10.3l1.5-1.5 2.7 2.7 6.3-6.3L16 6.7z" />
                </svg>
                Operador humano en línea
              </span>
            )}
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            Desde la detección de la IA hasta la intervención de un operador real. Sin sirenas
            automáticas: una persona verifica y actúa.
          </p>
        </div>

        {/* ── Audio del tótem ── */}
        <div
          className={`mt-4 rounded-xl border p-5 transition-colors duration-500 ${
            micActive ? "border-gold/40 bg-golddim/40" : "border-line bg-elev"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors duration-500 ${
                micActive
                  ? "border-gold/50 bg-gold/15 text-goldhi"
                  : "border-line bg-elev2 text-faint"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <rect x="9" y="2.5" width="6" height="11" rx="3" />
                <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" />
              </svg>
            </span>
            <div className="min-w-0">
              <div
                className={`text-[15px] font-bold transition-colors duration-500 ${
                  micActive ? "text-goldhi" : "text-faint"
                }`}
              >
                {micActive
                  ? "Micrófono del Tótem Activo"
                  : "Micrófono del Tótem — en espera"}
              </div>
              <div className="mt-0.5 font-mono text-[12px] text-muted">
                {speaking
                  ? "Emitiendo audio disuasivo · 92 dB"
                  : micActive
                    ? "Canal abierto · listo para emitir"
                    : "Canal cerrado"}
              </div>
            </div>
            {speaking && (
              <span className="alert-text ml-auto shrink-0 rounded-full bg-alert px-2.5 py-1 text-[10px] font-bold tracking-widest text-white">
                EN VIVO
              </span>
            )}
          </div>
          <div className="mt-3 rounded-lg border border-line bg-black/45 py-2">
            <Waveform active={speaking} />
          </div>
        </div>

        {/* ── Minuta del operador ── */}
        <div className="mt-4">
          <div className="flex items-center justify-between px-1 pb-2.5">
            <span className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
              Minuta del operador
            </span>
            <span className="font-mono text-[11px] text-faint">
              {visibleLog.length} / {OPERATOR_LOG.length} registros
            </span>
          </div>
          <div className="space-y-2">
            {visibleLog.map((l, i) => (
              <div
                key={i}
                className={`fade-up flex gap-3 rounded-lg border px-3.5 py-2.5 ${
                  l.kind === "quote"
                    ? "border-gold/35 bg-golddim/30"
                    : l.kind === "result"
                      ? "border-ok/30 bg-ok/[0.06]"
                      : "border-line bg-elev"
                }`}
              >
                <span className="shrink-0 pt-0.5 font-mono text-[11px] text-faint tabular-nums">
                  +{l.at.toFixed(1)}s
                </span>
                <span
                  className={`text-[13.5px] leading-relaxed ${
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

      {/* ── Cierre del incidente ── */}
      <div className="shrink-0 border-t border-line bg-elev px-6 py-5">
        <div className="mb-3 flex items-center gap-2 text-[12px] text-muted">
          <span className="font-semibold tracking-wide">Clasificación del operador:</span>
          <span className="rounded-md border border-ok/40 bg-ok/10 px-2 py-1 text-[12px] font-semibold text-ok">
            Amenaza real neutralizada
          </span>
          <span className="rounded-md border border-line px-2 py-1 text-[12px] text-faint">
            Falso positivo
          </span>
        </div>
        <button
          onClick={onClose}
          disabled={!canClose}
          className={`flex w-full items-center justify-center gap-2.5 rounded-xl px-6 py-4 text-[17px] font-bold transition-all duration-300 ${
            canClose
              ? "ok-glow cursor-pointer bg-ok text-white hover:brightness-110"
              : "cursor-default bg-elev2 text-faint"
          }`}
        >
          {canClose ? (
            <>
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor">
                <path d="M8.2 14.5 4 10.3l1.5-1.5 2.7 2.7 6.3-6.3L16 6.7z" />
              </svg>
              Cerrar Incidente — Amenaza Neutralizada
            </>
          ) : (
            "Esperando resolución del protocolo…"
          )}
        </button>
      </div>
    </div>
  );
}
