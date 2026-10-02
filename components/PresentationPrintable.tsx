"use client";

import Cam3Still from "./Cam3Still";
import Logo from "./Logo";
import ProductScene, { PRODUCT_SCENE_ORDER } from "./ProductScenes";
import { BRAND, REPORT, RESPONSE_TARGET } from "@/lib/config";
import { PRESENTATION_BEATS, PRESENTATION_STEPS } from "@/lib/presentationContent";

function PrintPage({
  number,
  children,
  className = "",
}: {
  number: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`presentation-print__page ${className}`}>
      <div className="presentation-print__brand">
        <Logo size="sm" />
        <span>{String(number).padStart(2, "0")} / 11</span>
      </div>
      {children}
    </section>
  );
}

function IncidentPage({ scene, number }: { scene: keyof typeof PRESENTATION_BEATS; number: number }) {
  const beat = PRESENTATION_BEATS[scene];
  const cleared = scene === "despejado";

  return (
    <PrintPage number={number}>
      <div className="presentation-print__incident">
        <figure className="presentation-print__camera">
          <Cam3Still
            uid={`presentation-print-${scene}`}
            kind={cleared ? "clear" : "intruder"}
            time={beat.hora}
            print
          />
          <figcaption>
            CAM 03 · PERÍMETRO LATERAL <span>{beat.hora}</span>
          </figcaption>
        </figure>

        <div>
          <p className={cleared ? "presentation-print__ok" : "presentation-print__alert"}>
            {beat.tag} · {beat.hora}
          </p>
          <h2>{beat.titulo}</h2>
          <p className="presentation-print__lead">{beat.texto}</p>

          {scene === "disuasion" && "cita" in beat && (
            <div className="presentation-print__quote">
              <p className="presentation-print__eyebrow">Altoparlante del tótem</p>
              <blockquote>«{beat.cita}»</blockquote>
              <div>
                <strong>{RESPONSE_TARGET},0 s</strong>
                <span> de la detección a la voz del operador</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </PrintPage>
  );
}

function ReportShot({ kind, uid, caption }: { kind: "intruder" | "clear"; uid: string; caption: string }) {
  return (
    <figure className="presentation-print__report-shot">
      <Cam3Still uid={uid} kind={kind} time="" print />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export default function PresentationPrintable() {
  return (
    <div className="print-only presentation-print" aria-hidden="true">
      <PrintPage number={1} className="presentation-print__cover">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="presentation-print__cover-image" src="/cams/cam1-poster.jpg" alt="" />
        <div className="presentation-print__cover-shade" />
        <div className="presentation-print__cover-content">
          <Logo size="xl" />
          <h1>
            Bienvenidos a la nueva era de la <span>seguridad</span>
          </h1>
          <p>Servicio de Vigilancia Inteligente 24/7 para Consorcios.</p>
          <small>Situación de caso de intrusión real a las 03:00 AM.</small>
        </div>
      </PrintPage>

      {PRODUCT_SCENE_ORDER.map((scene, index) => (
        <PrintPage number={index + 2} key={scene} className="presentation-print__product">
          <div className="presentation-print__product-content">
            <ProductScene scene={scene} />
          </div>
        </PrintPage>
      ))}

      <IncidentPage scene="deteccion" number={6} />
      <IncidentPage scene="disuasion" number={7} />
      <IncidentPage scene="despejado" number={8} />

      <PrintPage number={9}>
        <div className="presentation-print__standard">
          <p className="presentation-print__eyebrow">Cómo actúa la central</p>
          <h2>Paso a paso</h2>
          <p className="presentation-print__intro">
            La inteligencia artificial detecta. La decisión, siempre, la toma alguien de nuestra
            central. Eso evita las falsas alarmas y hace que el sospechoso se vaya antes de intentar
            nada.
          </p>
          <div className="presentation-print__steps">
            {PRESENTATION_STEPS.map((step) => (
              <article key={step.n}>
                <span>{step.n}</span>
                <h3>{step.titulo}</h3>
                <p>{step.texto}</p>
                <small>{step.pie}</small>
              </article>
            ))}
          </div>
        </div>
      </PrintPage>

      <PrintPage number={10}>
        <div className="presentation-print__standard presentation-print__report">
          <p className="presentation-print__eyebrow">Lo que recibe el administrador</p>
          <h2>Reporte al administrador</h2>
          <p className="presentation-print__intro">
            Un correo automático con la hora exacta, el tipo de evento, la clasificación del
            operador, la evidencia de video y las capturas del antes y el después.
          </p>
          <div className="presentation-print__report-shots">
            <ReportShot
              uid="presentation-print-report-a"
              kind="intruder"
              caption="03:14:22 — Intruso detectado por la IA."
            />
            <ReportShot
              uid="presentation-print-report-b"
              kind="clear"
              caption="03:14:31 — Perímetro despejado tras el aviso."
            />
          </div>
          <dl>
            {[
              ["Caso", REPORT.caseId],
              ["Tipo de evento", REPORT.eventType],
              ["Protocolo aplicado", REPORT.protocol],
              ["Estado", REPORT.status],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </PrintPage>

      <PrintPage number={11} className="presentation-print__closing">
        <div className="presentation-print__closing-content">
          <Logo size="xl" />
          <h2>
            Tecnología de vanguardia para tu <span>seguridad</span>
          </h2>
          <div>
            <p>Hacemos el relevamiento de tu edificio sin cargo</p>
            <strong>{BRAND.phone}</strong>
            <span>{BRAND.email}</span>
          </div>
          <small>{BRAND.central} · Simulación demostrativa</small>
        </div>
      </PrintPage>
    </div>
  );
}
