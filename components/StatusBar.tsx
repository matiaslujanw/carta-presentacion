"use client";

import { EVENT_TOWER } from "@/lib/config";

export type FeedState = "idle" | "alert" | "protocol" | "cleared";

const COPY: Record<FeedState, { text: string; tone: "ok" | "alert" | "gold" }> = {
  idle: { text: "IA Operando — No se detectan anomalías", tone: "ok" },
  alert: { text: `ALERTA DE INTELIGENCIA ARTIFICIAL GENERADA EN ${EVENT_TOWER}`, tone: "alert" },
  protocol: {
    text: `PROTOCOLO DE DISUASIÓN HUMANA EN CURSO — ${EVENT_TOWER} / PERÍMETRO LATERAL`,
    tone: "alert",
  },
  cleared: {
    text: "Incidente cerrado — Perímetro despejado. IA Operando en modo normal",
    tone: "gold",
  },
};

export default function StatusBar({
  state,
  clock,
  sello = true,
}: {
  state: FeedState;
  clock: string;
  /** Sello discreto que aclara que es una simulación comercial */
  sello?: boolean;
}) {
  const { text, tone } = COPY[state];
  const isAlert = tone === "alert";

  const color = isAlert ? "text-alert" : tone === "gold" ? "text-goldhi" : "text-ok";
  const dot = isAlert ? "bg-alert" : tone === "gold" ? "bg-gold" : "bg-ok";

  return (
    <div
      className={`flex h-[62px] shrink-0 items-center gap-4 border-t px-6 transition-colors duration-300 ${
        isAlert ? "border-alert/40 bg-alertdim" : "border-line bg-panel"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className={`absolute inset-0 rounded-full ${dot}`} />
          <span className={`rec-pulse absolute -inset-1.5 rounded-full ${dot} opacity-30`} />
        </span>
        <span className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
          Feed del sistema
        </span>
      </span>

      <span className="h-6 w-px bg-line" />

      <span
        className={`flex-1 truncate text-[17px] font-semibold tracking-wide ${color} ${
          isAlert ? "alert-text" : ""
        }`}
      >
        {text}
      </span>

      {sello && (
        <span className="shrink-0 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-white/40 uppercase">
          Simulación demostrativa
        </span>
      )}

      <span className="flex shrink-0 items-center gap-5 font-mono text-[12px] text-muted tabular-nums">
        <span>
          Eventos 24 h <span className="text-ink2">{state === "idle" ? "0" : "1"}</span>
        </span>
        <span>
          Uptime <span className="text-ink2">99,98 %</span>
        </span>
        <span className="text-ink2">{clock}</span>
      </span>
    </div>
  );
}
