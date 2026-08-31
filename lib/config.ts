/**
 * Configuración central de la demo.
 *
 * Todo lo editable por el equipo comercial vive acá: nombres, textos,
 * tiempos y las fuentes de imagen de cada cámara.
 *
 * MATERIAL REAL — cómo se usa:
 * Copiá las fotos a /public/cams/ con estos nombres exactos:
 *
 *   cam1.jpg  → Hall / entrada principal
 *   cam2.jpg  → Cochera / acceso vehicular
 *   cam3.jpg  → Perímetro lateral / reja  (la cámara del evento)
 *   cam4.jpg  → Vereda con el tótem
 *   intruso.png → silueta del sospechoso con fondo transparente (opcional)
 *
 * No hay que tocar código: si el archivo existe se usa la foto, y si no
 * existe la demo cae automáticamente en la escena vectorial de respaldo.
 * También acepta video en loop: seteá `video: "/cams/cam3.mp4"`.
 */

export const BRAND = {
  name: "Vig.IA",
  tagline: "Seguridad con Inteligencia",
  central: "Central de Monitoreo Vig.IA — NOA",
  email: "administracion@vigiaseguridad.com.ar",
  phone: "+54 9 381 415-6775",
} as const;

export type CameraId = 1 | 2 | 3 | 4;

export type Camera = {
  id: CameraId;
  /** Nombre corto que se ve en el overlay de la cámara */
  label: string;
  /** Ubicación descriptiva */
  zone: string;
  /** Escena SVG placeholder a usar si no hay imagen real */
  scene: "hall" | "cochera" | "perimetro" | "totem";
  /** Ruta a una imagen real (opcional). Si existe, reemplaza a la escena */
  image?: string;
  /** Ruta a un video real (opcional). Tiene prioridad sobre image */
  video?: string;
  /** true = feed en modo infrarrojo (gris/verde nocturno) */
  ir?: boolean;
  /**
   * Corrección de imagen sobre la foto real:
   *  "night" (default) — baja saturación y luz: una foto de día pasa por noche
   *  "ir"              — blanco y negro con tinte verde de visión nocturna
   *  "none"            — la foto se usa tal cual (ya es una captura real de CCTV)
   */
  grade?: "night" | "ir" | "none";
  /**
   * Recorte por zoom, 1 = sin recortar. Los clips generados vienen con el
   * viñeteado circular de ojo de pez quemado en la imagen: un zoom de 1.2 se
   * come los arcos negros de las esquinas y deja el cuadro limpio.
   */
  zoom?: number;
};

export const CAMERAS: Camera[] = [
  {
    id: 1,
    label: "CAM 01",
    zone: "Entrada principal / Hall",
    scene: "hall",
    video: "/cams/cam1.mp4",
    grade: "none",
    zoom: 1.22,
  },
  {
    id: 2,
    label: "CAM 02",
    zone: "Cochera / Acceso vehicular",
    scene: "cochera",
    video: "/cams/cam2.mp4",
    grade: "none",
    zoom: 1.22,
  },
  {
    id: 3,
    label: "CAM 03",
    zone: "Perímetro lateral / Rejas",
    scene: "perimetro",
    // El video lo maneja EVENT_TAKE, porque esta cámara tiene tres estados
    grade: "none",
    ir: true,
  },
  {
    id: 4,
    label: "CAM 04",
    zone: "Tótem de Seguridad",
    scene: "totem",
    // Pre-cableada: apenas exista cam4.mp4 se usa sola, sin tocar nada.
    // Mientras no esté, cae en la escena vectorial del tótem.
    video: "/cams/cam4.mp4",
    grade: "none",
    zoom: 1.22,
  },
];

/** La cámara donde ocurre el evento */
export const EVENT_CAMERA: CameraId = 3;

/** Torre / sector que se nombra en la alerta */
export const EVENT_TOWER = "TORRE A";

/** Hora simulada del incidente (el brief pide 03:14 AM) */
export const EVENT_TIME = "03:14";

export const DETECTION = {
  /** Confianza final que muestra el bounding box */
  confidence: 98,
  /** Confianza inicial del lock-on, sube hasta `confidence` */
  confidenceStart: 71,
  label: "Intruso Detectado",
  secondary: "Merodeo Sospechoso — Alerta Fase 1",
  classId: "PERSONA",
} as const;

/** Minuta del operador: se tipea línea por línea en la Pantalla 3 */
export const OPERATOR_LOG: { at: number; text: string; kind?: "action" | "quote" | "result" }[] = [
  { at: 0.4, text: "Alerta recibida de analítica de video — Cám. 03 Perímetro lateral.", kind: "action" },
  { at: 1.2, text: "Verificación humana en curso. Se confirma presencia no autorizada.", kind: "action" },
  { at: 2.0, text: "Micrófono del tótem activado. Canal de audio abierto.", kind: "action" },
  {
    at: 3.0,
    text: "«Atención: usted está siendo filmado y la policía está en camino. Retírese del perímetro inmediatamente.»",
    kind: "quote",
  },
  { at: 5.2, text: "Aviso por altoparlante emitido. El sospechoso se retira del perímetro.", kind: "result" },
  { at: 6.4, text: "Perímetro despejado. Se notifica a móvil de patrullaje para ronda de verificación.", kind: "result" },
];

/** Tiempo de respuesta que se muestra como logro (segundos) */
export const RESPONSE_TARGET = 3;

export const REPORT = {
  eventType: "Intrusión perimetral prevenida por analítica de video",
  status: "Caso cerrado con éxito — sin daños materiales",
  protocol: "Disuasión humana remota vía audio del tótem",
  classification: "Amenaza real neutralizada",
  caseId: "VIG-2026-04817",
} as const;

/** Duración de cada paso en modo auto-play (ms) */
export const AUTOPLAY_MS = {
  panel: 6000,
  alert: 7000,
  protocol: 12000,
  report: 11000,
} as const;

/** Lee ?consorcio= de la URL, con fallback */
export const DEFAULT_CONSORCIO = "Torres del Bosque";

/**
 * Logo real de la empresa.
 * Copiá VIGIA_logo_transparente.png a /public/vigia-logo.png y poné
 * LOGO_SRC = "/vigia-logo.png" para usarlo en vez del wordmark dibujado.
 */
export const LOGO_SRC = "";


/**
 * Tratamiento que convierte una foto común en algo que se lee como feed de
 * cámara: leve desenfoque de lente, menos saturación, más contraste y menos
 * luz. Subí o bajá según cómo queden tus fotos.
 */
export const GRADE = {
  night: "blur(0.7px) saturate(0.42) brightness(0.5) contrast(1.22)",
  ir: "blur(0.8px) grayscale(1) brightness(0.62) contrast(1.42)",
  none: "blur(0.4px)",
} as const;

/**
 * El sospechoso sobre la Cam 03.
 *
 * `image` acepta un PNG con fondo transparente (recortado). Si el archivo no
 * está, se dibuja la silueta vectorial de respaldo.
 *
 * `figure` y `box` están en % del cuadro de la cámara: si cambiás la foto de
 * la reja, ajustá estos cuatro valores para que el recuadro de la IA caiga
 * justo sobre la persona. No hace falta tocar nada más.
 */
export const INTRUDER = {
  /**
   * "overlay" — la persona la dibuja la demo (PNG recortado o silueta
   *             vectorial) encima del feed. El recuadro de la IA la sigue
   *             perfecto porque los dos los controla la app.
   * "baked"   — la persona ya viene grabada dentro del video de la Cam 03.
   *             La demo no dibuja ninguna silueta: sólo el recuadro.
   * "auto"    — usa "baked" si el clip cam3-intruso.mp4 existe, y si no
   *             vuelve a "overlay". Es el modo por defecto: dejás caer los
   *             videos en public/cams/ y se acomoda solo.
   */
  mode: "auto" as "auto" | "overlay" | "baked",
  image: "/cams/intruso.png",
  figure: { left: 56.5, top: 16, width: 12.5, height: 54 },
  box: { left: 54.5, top: 13, width: 16.5, height: 60 },
  /**
   * Posición del recuadro cuando la persona viene grabada en el video.
   * Se calibra mirando el clip: es el único número que hay que ajustar a mano
   * cuando cambia el material de la Cam 03.
   */
  boxBaked: { left: 46.5, top: 35, width: 14.5, height: 48 },
  /**
   * Con la persona grabada en el video no se la puede seguir cuando escapa:
   * el tracker "pierde" el objetivo, que es exactamente lo que hace un sistema
   * real. Segundos desde que arranca la fuga hasta que el recuadro se pierde.
   */
  lostAfter: 1.1,
};

/**
 * La cámara del evento (Cam 03) sale de UNA SOLA TOMA CONTINUA.
 *
 * El clip real filma, sin cortar, las tres cosas que necesita la demo:
 *
 *   1,90 → 3,50 s   la persona merodeando junto a la reja  (Hojas 2 y 3)
 *   3,50 → 6,60 s   se retira y el cuadro se vacía         (final de la Hoja 3)
 *   6,55 → 7,95 s   el perímetro vacío, en loop            (Hoja 1)
 *
 * Al ser el mismo plano, el encuadre y la luz coinciden por construcción: no
 * hay forma de que se note un salto entre pantallas. Si algún día cambiás el
 * material, lo único que hay que retocar son estos segundos y INTRUDER.boxBaked.
 */
export const EVENT_TAKE = {
  src: "/cams/cam3.mp4",
  idle: { start: 6.55, end: 7.95 },
  intruder: { start: 1.9, end: 3.5 },
  flee: { start: 3.5, end: 6.6 },
} as const;

export const SNAPSHOT_FRAMES = {
  /** Frame con el intruso detectado */
  intruder: { clip: EVENT_TAKE.src, at: 2.7, still: "" },
  /** Frame del perímetro ya despejado */
  clear: { clip: EVENT_TAKE.src, at: 7.5, still: "" },
} as const;
