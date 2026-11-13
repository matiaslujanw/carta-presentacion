"use client";

import Cam3Still from "@/components/Cam3Still";
import Logo from "@/components/Logo";
import { BRAND, EVENT_TIME, REPORT, RESPONSE_TARGET } from "@/lib/config";
import type { AudiovisualSceneId } from "@/lib/audiovisualContent";
import styles from "./AudiovisualExperience.module.css";

function Video({ src, className = "" }: { src: string; className?: string }) {
  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      className={`${styles.mediaFill} ${className}`}
    />
  );
}

function SceneHeading({
  eyebrow,
  title,
  copy,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? styles.headingCenter : styles.heading}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2>{title}</h2>
      {copy && <p className={styles.sceneCopy}>{copy}</p>}
    </div>
  );
}

function OpeningScene() {
  return (
    <section className={`${styles.scene} ${styles.openingScene}`} aria-label="Presentación de Vig.IA">
      <Video src="/cams/cam1.mp4" className={styles.openingVideo} />
      <div className={styles.openingShade} />
      <div className={styles.scanGrid} />
      <div className={styles.openingContent}>
        <div className={styles.logoReveal}>
          <Logo size="xl" />
        </div>
        <p className={styles.eyebrow}>Seguridad con inteligencia</p>
        <h1>
          La seguridad que <span>se anticipa</span>
        </h1>
        <p className={styles.openingClaim}>Inteligencia artificial + respuesta humana</p>
        <div className={styles.openingSignals}>
          <span><i /> Vigilancia 24/7</span>
          <span><i /> Verificación humana</span>
          <span><i /> Evidencia completa</span>
        </div>
      </div>
    </section>
  );
}

const PROBLEM_CARDS = [
  {
    label: "Solo grabar",
    value: "Después",
    detail: "La evidencia llega cuando el hecho ya ocurrió.",
    icon: "record",
  },
  {
    label: "Alertar sin verificar",
    value: "Ruido",
    detail: "Las falsas alarmas desgastan la respuesta.",
    icon: "alert",
  },
  {
    label: "Detectar + verificar",
    value: "A tiempo",
    detail: "La tecnología encuentra. Una persona decide.",
    icon: "shield",
  },
] as const;

function ProblemIcon({ kind }: { kind: (typeof PROBLEM_CARDS)[number]["icon"] }) {
  if (kind === "record") {
    return <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></svg>;
  }
  if (kind === "alert") {
    return <svg viewBox="0 0 24 24"><path d="M12 3 2.8 19h18.4L12 3Z" /><path d="M12 8v5M12 16.7h.01" /></svg>;
  }
  return <svg viewBox="0 0 24 24"><path d="M12 3 19 6v5.7c0 4.2-2.9 7.5-7 9.3-4.1-1.8-7-5.1-7-9.3V6l7-3Z" /><path d="m8.6 12 2.2 2.2 4.7-5" /></svg>;
}

function ProblemScene() {
  return (
    <section className={`${styles.scene} ${styles.problemScene}`} aria-label="El problema de la seguridad tradicional">
      <div className={styles.orbit} />
      <SceneHeading
        eyebrow="Más que cámaras"
        title="Grabar lo que pasó ya no alcanza"
        copy="La seguridad se vuelve prevención cuando detectar, verificar y actuar forman parte del mismo sistema."
        align="center"
      />
      <div className={styles.problemFlow}>
        {PROBLEM_CARDS.map((card, index) => (
          <article key={card.label} className={`${styles.problemCard} ${index === 2 ? styles.problemCardActive : ""}`}>
            <div className={styles.problemIcon}><ProblemIcon kind={card.icon} /></div>
            <p>{card.label}</p>
            <strong>{card.value}</strong>
            <span>{card.detail}</span>
          </article>
        ))}
      </div>
      <div className={styles.problemConclusion}>
        <span>01 · Detectar</span><b>→</b><span>02 · Verificar</span><b>→</b><span>03 · Actuar</span>
      </div>
    </section>
  );
}

const ACCESS_ITEMS = [
  {
    label: "Acceso biométrico",
    sub: "Rostro · palma · código",
    image: "/accesos/ingreso-peatonal.jpg",
  },
  {
    label: "Cámara LPR",
    sub: "La patente abre el portón",
    image: "/accesos/ingreso-vehicular.jpg",
  },
  {
    label: "Tótem IA",
    sub: "Un operador real dentro del edificio",
    image: "/cams/cam4.jpg",
  },
] as const;

function AccessScene({ progress }: { progress: number }) {
  const active = Math.min(2, Math.floor(progress * 3));
  return (
    <section className={`${styles.scene} ${styles.accessScene}`} aria-label="Control de accesos inteligentes">
      <SceneHeading
        eyebrow="Todos los días"
        title="Ingresos simples, seguros y registrados"
        copy="Una experiencia fluida para las personas autorizadas. Un registro claro para la administración."
      />
      <div className={styles.accessGallery}>
        {ACCESS_ITEMS.map((item, index) => (
          <article key={item.label} className={`${styles.accessCard} ${active === index ? styles.accessCardActive : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt="" />
            <div className={styles.accessShade} />
            <div className={styles.accessInfo}>
              <span>0{index + 1}</span>
              <h3>{item.label}</h3>
              <p>{item.sub}</p>
            </div>
            {index === 0 && <div className={styles.faceScan}><i /><span>IDENTIDAD VALIDADA</span></div>}
            {index === 1 && <div className={styles.plateRead}>AB 452 KJ <span>AUTORIZADO</span></div>}
            {index === 2 && <div className={styles.liveOperator}><i /> OPERADOR EN LÍNEA</div>}
          </article>
        ))}
      </div>
    </section>
  );
}

function Feed({
  label,
  src,
  image,
  alert = false,
  large = false,
}: {
  label: string;
  src?: string;
  image?: string;
  alert?: boolean;
  large?: boolean;
}) {
  return (
    <article className={`${styles.feed} ${large ? styles.feedLarge : ""} ${alert ? styles.feedAlert : ""}`}>
      {src ? <Video src={src} /> : image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className={styles.mediaFill} />
      ) : null}
      <div className={styles.feedGrade} />
      <header><span>{label}</span><b><i /> EN VIVO</b></header>
      {alert && (
        <>
          <div className={styles.trackingBox}><span>PERSONA · 98%</span></div>
          <div className={styles.alertBadge}>MERODEO SOSPECHOSO</div>
        </>
      )}
    </article>
  );
}

function MonitoringScene({ progress }: { progress: number }) {
  const alert = progress > 0.3;
  return (
    <section className={`${styles.scene} ${styles.monitoringScene}`} aria-label="Monitoreo mediante inteligencia artificial">
      <div className={styles.monitoringCopy}>
        <SceneHeading
          eyebrow="Vigilancia inteligente 24/7"
          title="La IA detecta lo que importa"
          copy="Analítica permanente sobre las cámaras existentes y alertas definidas para cada edificio."
        />
        <div className={styles.monitoringStats}>
          <div><strong>98%</strong><span>confianza de detección</span></div>
          <div><strong>{EVENT_TIME}</strong><span>hora del evento</span></div>
        </div>
      </div>
      <div className={styles.feedGrid}>
        <Feed label="CAM 03 · PERÍMETRO" src="/cams/cam3.mp4" alert={alert} large />
        <Feed label="CAM 01 · HALL" src="/cams/cam1.mp4" />
        <Feed label="CAM 02 · COCHERA" src="/cams/cam2.mp4" />
        <Feed label="CAM 04 · TÓTEM" image="/cams/cam4.jpg" />
      </div>
    </section>
  );
}

function InterventionScene() {
  return (
    <section className={`${styles.scene} ${styles.interventionScene}`} aria-label="Disuasión e intervención humana">
      <SceneHeading
        eyebrow="Decisión humana"
        title="La alerta llega. Una persona responde."
        copy="El operador verifica la imagen y aplica el protocolo acordado para el edificio."
      />
      <div className={styles.interventionVisual}>
        <div className={styles.operatorCard}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/cams/cam4.jpg" alt="Operador de la central en el Tótem IA" />
          <div><i /><span>Central Vig.IA</span><strong>Operador conectado</strong></div>
        </div>
        <div className={styles.responsePulse}>
          <span>Tiempo de respuesta</span>
          <strong>{RESPONSE_TARGET},0</strong>
          <b>segundos</b>
        </div>
        <div className={styles.interventionCamera}>
          <Cam3Still uid="audiovisual-intervention" kind="intruder" time={`${EVENT_TIME}:25`} />
          <div className={styles.voiceMessage}>
            <span>ALTOPARLANTE DEL TÓTEM</span>
            <p>“Usted está siendo filmado. Retírese del perímetro inmediatamente.”</p>
            <div className={styles.voiceWave}>{Array.from({ length: 18 }, (_, i) => <i key={i} />)}</div>
          </div>
        </div>
      </div>
      <div className={styles.interventionResult}><i /> Protocolo aplicado · perímetro despejado</div>
    </section>
  );
}

const TRACE_EVENTS = [
  ["03:14:22", "IA detecta merodeo", "CAM 03"],
  ["03:14:25", "Operador verifica", "CENTRAL"],
  ["03:14:28", "Audio disuasivo emitido", "TÓTEM"],
  ["03:14:31", "Perímetro despejado", "CERRADO"],
] as const;

function TraceabilityScene() {
  return (
    <section className={`${styles.scene} ${styles.traceScene}`} aria-label="Registro, trazabilidad e informes">
      <SceneHeading
        eyebrow="Todo queda registrado"
        title="Evidencia clara para saber qué ocurrió"
        copy="Hora exacta, clasificación, actuación del operador y capturas asociadas al evento."
      />
      <div className={styles.traceContent}>
        <div className={styles.eventLog}>
          <header><span>Minuta del evento</span><b>{REPORT.caseId}</b></header>
          {TRACE_EVENTS.map(([time, action, source], index) => (
            <div key={time} className={styles.eventRow}>
              <span>{time}</span><i className={index === TRACE_EVENTS.length - 1 ? styles.eventOk : ""} />
              <p>{action}</p><b>{source}</b>
            </div>
          ))}
          <footer><span>Resguardado según contrato</span><b>✓ Integridad verificada</b></footer>
        </div>
        <div className={styles.reportCard}>
          <div className={styles.reportTitle}><span>Reporte automático</span><b>Entregado</b></div>
          <div className={styles.reportShots}>
            <Cam3Still uid="audiovisual-report-before" kind="intruder" time="03:14:22" />
            <Cam3Still uid="audiovisual-report-after" kind="clear" time="03:14:31" />
          </div>
          <p>{REPORT.status}</p>
        </div>
      </div>
    </section>
  );
}

function ClosingScene() {
  return (
    <section className={`${styles.scene} ${styles.closingScene}`} aria-label="Cierre comercial">
      <div className={styles.closingGlow} />
      <div className={styles.closingContent}>
        <Logo size="xl" />
        <p className={styles.eyebrow}>Una solución integral</p>
        <h2>Tecnología que detecta.<br /><span>Personas que actúan.</span></h2>
        <p>Hacemos el relevamiento de tu edificio sin cargo.</p>
        <div className={styles.closingActions}>
          <a href={`https://wa.me/${BRAND.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
            Hablar por WhatsApp
          </a>
          <a href="mailto:administracion@vigiaseguridad.com.ar" className={styles.secondaryAction}>Enviar un correo</a>
        </div>
        <div className={styles.contactLine}>{BRAND.phone} · {BRAND.email}</div>
      </div>
    </section>
  );
}

export default function SceneRenderer({ id, progress }: { id: AudiovisualSceneId; progress: number }) {
  if (id === "apertura") return <OpeningScene />;
  if (id === "problema") return <ProblemScene />;
  if (id === "accesos") return <AccessScene progress={progress} />;
  if (id === "monitoreo") return <MonitoringScene progress={progress} />;
  if (id === "intervencion") return <InterventionScene />;
  if (id === "trazabilidad") return <TraceabilityScene />;
  return <ClosingScene />;
}
