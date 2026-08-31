"use client";

/**
 * Versión imprimible del reporte, en hoja A4 y fuera del escenario escalado.
 * Solo se muestra al imprimir (clase .print-only en globals.css), así el
 * botón "Descargar reporte (PDF)" produce un documento limpio y legible.
 */

import Cam3Still, { type SnapshotKind } from "./Cam3Still";
import { BRAND, EVENT_TIME, EVENT_TOWER, REPORT, RESPONSE_TARGET } from "@/lib/config";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td style={{ padding: "7px 0", color: "#666", fontSize: 11, width: 165 }}>{label}</td>
      <td style={{ padding: "7px 0", color: "#111", fontSize: 12, fontWeight: 600 }}>{value}</td>
    </tr>
  );
}

function Shot({ uid, kind, caption }: { uid: string; kind: SnapshotKind; caption: string }) {
  return (
    <div style={{ width: "48%" }}>
      <div style={{ border: "1px solid #ccc", overflow: "hidden" }}>
        <Cam3Still uid={uid} kind={kind} time="" print />
      </div>
      <p style={{ marginTop: 5, fontSize: 10, color: "#555", lineHeight: 1.4 }}>{caption}</p>
    </div>
  );
}

export default function ReportPrintable({
  consorcio,
  dateLabel,
}: {
  consorcio: string;
  dateLabel: string;
}) {
  return (
    <div
      className="print-only"
      style={{
        padding: "26mm 18mm",
        background: "#fff",
        color: "#111",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "2px solid #d4a13a",
          paddingBottom: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Vig<span style={{ color: "#b8860b" }}>.IA</span>
          </div>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#777", marginTop: 3 }}>
            Seguridad con Inteligencia
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#777" }}>
            Reporte de incidente
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 3 }}>{REPORT.caseId}</div>
          <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>
            {dateLabel} — {EVENT_TIME} AM
          </div>
        </div>
      </header>

      <div
        style={{
          marginTop: 18,
          border: "1px solid #b7e4cf",
          background: "#f2fbf6",
          padding: "12px 16px",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0a7a52" }}>{REPORT.status}</div>
        <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
          Sin intervención policial necesaria. Sin costo adicional para el consorcio.
        </div>
      </div>

      <table style={{ width: "100%", marginTop: 18, borderCollapse: "collapse" }}>
        <tbody>
          <Field label="Consorcio" value={consorcio} />
          <Field label="Fecha y hora" value={`${dateLabel} — ${EVENT_TIME} AM`} />
          <Field label="Sector" value={`${EVENT_TOWER} · Perímetro lateral (Cám. 03)`} />
          <Field label="Tipo de evento" value={REPORT.eventType} />
          <Field label="Detección" value="Analítica de video Vig.IA · Confianza 98%" />
          <Field label="Tiempo de respuesta" value={`${RESPONSE_TARGET} segundos`} />
          <Field label="Protocolo aplicado" value={REPORT.protocol} />
          <Field label="Clasificación final" value={REPORT.classification} />
        </tbody>
      </table>

      <h3 style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#777", marginTop: 22 }}>
        Evidencia adjunta
      </h3>
      <div style={{ display: "flex", gap: "4%", marginTop: 8 }}>
        <Shot
          uid="prt-a"
          kind="intruder"
          caption="03:14:22 — Intruso detectado por la IA sobre la reja perimetral (confianza 98%)."
        />
        <Shot
          uid="prt-b"
          kind="clear"
          caption="03:14:31 — Perímetro despejado tras el aviso por altoparlante."
        />
      </div>

      <footer style={{ marginTop: 26, borderTop: "1px solid #ddd", paddingTop: 12, fontSize: 9.5, color: "#666", lineHeight: 1.6 }}>
        Reporte generado automáticamente por la plataforma Vig.IA ante cada evento detectado, con la
        evidencia audiovisual y la minuta completa del operador. {BRAND.central} · {BRAND.phone} ·{" "}
        {BRAND.email}
        <br />
        <strong>Documento de demostración comercial — los datos y las imágenes son simulados.</strong>
      </footer>
    </div>
  );
}
