"use client";

import Logo from "./Logo";
import Cam3Still, { type SnapshotKind } from "./Cam3Still";
import { BRAND, EVENT_TIME, EVENT_TOWER, REPORT, RESPONSE_TARGET } from "@/lib/config";

/** Miniatura adjunta al reporte */
function Snapshot({
  uid,
  kind,
  caption,
  time,
}: {
  uid: string;
  kind: SnapshotKind;
  caption: string;
  time: string;
}) {
  return (
    <figure className="overflow-hidden rounded-lg border border-line bg-black">
      <Cam3Still uid={uid} kind={kind} time={time} />
      <figcaption className="border-t border-line bg-elev px-3 py-2 text-[12px] text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "ok" | "alert" }) {
  return (
    <div className="flex gap-4 border-b border-line py-2 last:border-0">
      <span className="w-[176px] shrink-0 text-[13px] text-muted">{label}</span>
      <span
        className={`text-[13.5px] font-semibold ${
          tone === "ok" ? "text-ok" : tone === "alert" ? "text-alert" : "text-ink"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function ReportModal({
  consorcio,
  dateLabel,
  onFinish,
  onDownload,
}: {
  consorcio: string;
  dateLabel: string;
  onFinish: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[3px]">
      <div className="pop-in flex max-h-[92%] w-[1080px] flex-col overflow-hidden rounded-2xl border border-line2 bg-panel shadow-2xl">
        {/* Chrome de cliente de correo */}
        <div className="flex shrink-0 items-center gap-3 border-b border-line bg-elev px-6 py-3.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ok/15 text-ok">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7l9 6 9-6" />
              <rect x="3" y="5" width="18" height="14" rx="2" />
            </svg>
          </span>
          <span className="text-[13px] font-semibold tracking-wide text-ink">
            Reporte automático enviado
          </span>
          <span className="ml-auto flex items-center gap-2 font-mono text-[12px] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-ok" />
            Entregado · {dateLabel} 03:19
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Encabezado del reporte */}
          <div className="flex items-start justify-between gap-6 border-b border-line px-8 py-5">
            <Logo size="lg" />
            <div className="text-right">
              <div className="text-[11px] font-semibold tracking-[0.18em] text-muted uppercase">
                Reporte de incidente
              </div>
              <div className="mt-1 font-mono text-[15px] font-bold text-goldhi">
                {REPORT.caseId}
              </div>
              <div className="mt-1 font-mono text-[12px] text-muted">
                {dateLabel} — {EVENT_TIME} AM
              </div>
            </div>
          </div>

          {/* Destinatario */}
          <div className="space-y-1 border-b border-line bg-elev/50 px-8 py-3 font-mono text-[12.5px]">
            <div>
              <span className="text-faint">Para: </span>
              <span className="text-ink2">Administración — {consorcio}</span>
            </div>
            <div>
              <span className="text-faint">CC: </span>
              <span className="text-ink2">{BRAND.email}</span>
            </div>
            <div>
              <span className="text-faint">Asunto: </span>
              <span className="font-semibold text-ink">
                [Vig.IA] Intrusión perimetral prevenida — {EVENT_TOWER} — {EVENT_TIME} AM
              </span>
            </div>
          </div>

          {/* Detalle */}
          <div className="px-8 py-5">
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-ok/35 bg-ok/[0.08] px-5 py-3.5">
              <svg viewBox="0 0 20 20" className="h-6 w-6 shrink-0 text-ok" fill="currentColor">
                <path d="M8.2 14.5 4 10.3l1.5-1.5 2.7 2.7 6.3-6.3L16 6.7z" />
              </svg>
              <div>
                <div className="text-[16px] font-bold text-ok">{REPORT.status}</div>
                <div className="text-[13px] text-muted">
                  Sin intervención policial necesaria. Sin costo adicional para el consorcio.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-10">
              <div>
                <Row label="Consorcio" value={consorcio} />
                <Row label="Fecha y hora" value={`${dateLabel} — ${EVENT_TIME} AM`} />
                <Row label="Sector" value={`${EVENT_TOWER} · Perímetro lateral (Cám. 03)`} />
                <Row label="Tipo de evento" value={REPORT.eventType} tone="alert" />
              </div>
              <div>
                <Row label="Detección" value="Analítica de video Vig.IA · Confianza 98%" />
                <Row label="Tiempo de respuesta" value={`${RESPONSE_TARGET} segundos`} tone="ok" />
                <Row label="Protocolo aplicado" value={REPORT.protocol} />
                <Row label="Clasificación final" value={REPORT.classification} tone="ok" />
              </div>
            </div>

            {/* Adjuntos */}
            <div className="mt-5">
              <div className="mb-3 flex items-center gap-2">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-muted"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M21 12.5 12.5 21a4.6 4.6 0 0 1-6.5-6.5l8-8a3 3 0 0 1 4.3 4.3l-8 8a1.4 1.4 0 0 1-2-2l7.3-7.3" />
                </svg>
                <span className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
                  2 capturas adjuntas
                </span>
              </div>
              <div className="grid max-w-[700px] grid-cols-2 gap-4">
                <Snapshot
                  uid="rep-a"
                  kind="intruder"
                  time={`${EVENT_TIME}:22`}
                  caption="03:14:22 — Intruso detectado por la IA."
                />
                <Snapshot
                  uid="rep-b"
                  kind="clear"
                  time="03:14:31"
                  caption="03:14:31 — Perímetro despejado tras el aviso."
                />
              </div>
            </div>

            <p className="mt-4 border-t border-line pt-3 text-[12px] leading-relaxed text-muted">
              Este reporte se genera y se envía de forma automática al administrador del consorcio
              ante cada evento detectado, con la evidencia audiovisual asociada y la minuta completa
              del operador. Consultas: {BRAND.phone} · {BRAND.email}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex shrink-0 items-center gap-3 border-t border-line bg-elev px-8 py-5">
          <button
            onClick={onDownload}
            className="cursor-pointer rounded-xl border border-line2 px-5 py-3.5 text-[14px] font-semibold text-ink2 transition-colors hover:bg-white/[0.05]"
          >
            Descargar reporte (PDF)
          </button>
          <button
            onClick={onFinish}
            className="ml-auto cursor-pointer rounded-xl bg-gold px-7 py-3.5 text-[16px] font-bold text-black transition-all hover:brightness-110"
          >
            Finalizar Demostración
          </button>
        </div>
      </div>
    </div>
  );
}
