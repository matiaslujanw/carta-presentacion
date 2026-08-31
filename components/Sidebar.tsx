"use client";

import Logo from "./Logo";
import { BRAND } from "@/lib/config";

type Item = { key: string; label: string; icon: React.ReactNode };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ITEMS: Item[] = [
  {
    key: "monitoreo",
    label: "Monitoreo",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[21px] w-[21px]" {...stroke}>
        <rect x="2.5" y="4" width="19" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    key: "alertas",
    label: "Alertas",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[21px] w-[21px]" {...stroke}>
        <path d="M12 3.5a6.5 6.5 0 0 0-6.5 6.5c0 4.2-1.7 5.6-1.7 5.6h16.4s-1.7-1.4-1.7-5.6A6.5 6.5 0 0 0 12 3.5Z" />
        <path d="M10 19a2 2 0 0 0 4 0" />
      </svg>
    ),
  },
  {
    key: "reportes",
    label: "Reportes",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[21px] w-[21px]" {...stroke}>
        <path d="M6 3.5h8l4.5 4.5v12.5H6z" />
        <path d="M14 3.5V8h4.5M9 13h6M9 16.5h6" />
      </svg>
    ),
  },
  {
    key: "soporte",
    label: "Soporte",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[21px] w-[21px]" {...stroke}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M9.6 9.6a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.2 1-1.2 1.8" />
        <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export default function Sidebar({
  active = "monitoreo",
  alertCount = 0,
}: {
  active?: string;
  alertCount?: number;
}) {
  return (
    <aside className="flex w-[268px] shrink-0 flex-col border-r border-line bg-panel">
      <div className="border-b border-line px-6 py-6">
        <Logo size="md" />
      </div>

      <nav className="flex-1 px-3.5 py-5">
        <div className="px-2.5 pb-3 text-[10px] font-semibold tracking-[0.2em] text-faint uppercase">
          Central de operaciones
        </div>
        {ITEMS.map((it) => {
          const isActive = it.key === active;
          const badge = it.key === "alertas" ? alertCount : 0;
          return (
            <div
              key={it.key}
              className={`relative mb-1 flex items-center gap-3.5 rounded-lg px-3 py-3 text-[15px] transition-colors ${
                isActive
                  ? "bg-white/[0.06] font-semibold text-ink"
                  : "font-medium text-muted hover:bg-white/[0.03]"
              }`}
            >
              {isActive && (
                <span className="absolute top-1/2 left-0 h-6 w-[3px] -translate-y-1/2 rounded-r bg-gold" />
              )}
              <span className={isActive ? "text-goldhi" : "text-faint"}>{it.icon}</span>
              <span>{it.label}</span>
              {badge > 0 && (
                <span className="alert-text ml-auto rounded-full bg-alert px-2 py-0.5 text-[11px] font-bold text-white tabular-nums">
                  {badge}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Estado del motor de IA */}
      <div className="mx-3.5 mb-3.5 rounded-xl border border-line bg-elev p-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inset-0 rounded-full bg-ok" />
            <span className="rec-pulse absolute -inset-1 rounded-full bg-ok/30" />
          </span>
          <span className="text-[12px] font-semibold tracking-wide text-ink">
            Motor de IA activo
          </span>
        </div>
        <div className="mt-3 space-y-1.5 font-mono text-[11px] text-muted">
          <div className="flex justify-between">
            <span>Analítica</span>
            <span className="text-ink2">v4.2 · perimetral</span>
          </div>
          <div className="flex justify-between">
            <span>Latencia</span>
            <span className="text-ink2">42 ms</span>
          </div>
          <div className="flex justify-between">
            <span>Canales</span>
            <span className="text-ink2">4 / 4 online</span>
          </div>
        </div>
      </div>

      {/* Operador */}
      <div className="flex items-center gap-3 border-t border-line px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-golddim text-[13px] font-bold text-goldhi">
          RM
        </div>
        <div className="min-w-0 leading-tight">
          <div className="truncate text-[13px] font-semibold text-ink">Op. R. Medina</div>
          <div className="truncate text-[11px] text-muted">{BRAND.central}</div>
        </div>
      </div>
    </aside>
  );
}
