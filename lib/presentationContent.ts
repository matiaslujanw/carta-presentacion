export type PresentationBeatKey = "deteccion" | "disuasion" | "despejado";

export type PresentationBeat = {
  tag: string;
  hora: string;
  titulo: string;
  texto: string;
  cita?: string;
};

export const PRESENTATION_BEATS: Record<PresentationBeatKey, PresentationBeat> = {
  deteccion: {
    tag: "La IA detecta",
    hora: "03:14:22",
    titulo: "Una persona es detectada por la IA merodeando una zona prohibida",
    texto:
      "La analítica de video lo marca sola, con 98% de confianza. Nadie en el edificio se enteró todavía, y no sonó ninguna sirena.",
  },
  disuasion: {
    tag: "Responde una persona",
    hora: "03:14:25",
    titulo: "Solo 3 segundos después, un operador recibe el alerta por imagen en vivo",
    texto:
      "No es un robot: es un guardia que ve la imagen en vivo y actúa según protocolo establecido. En este caso emite un mensaje al intruso mediante altavoz.",
    cita:
      "Usted está siendo filmado y la policía está en camino. Retírese del perímetro inmediatamente.",
  },
  despejado: {
    tag: "Se va",
    hora: "03:14:31",
    titulo: "Perímetro despejado",
    texto:
      "El intruso se retira del lugar sin lograr su cometido y sin emitir alerta a todo el consorcio en la madrugada. A la mañana siguiente, el administrador tiene en su correo el reporte completo de lo acontecido.",
  },
};

export const PRESENTATION_STEPS = [
  {
    n: "01",
    titulo: "La IA vigila sin descanso",
    texto:
      "La analítica observa las cámaras del consorcio durante las 24 horas del día, los 365 días del año, y emite las alertas predeterminadas: alguien merodeando, alguien detectado en una zona roja o un horario no habitual.",
    pie: "Analítica de video — cámaras + Tótem IA",
  },
  {
    n: "02",
    titulo: "Un operador verifica el alerta en solo 3 segundos",
    texto:
      "Acá está la diferencia. El operador abre la imagen en vivo y actúa según protocolo. Esto evita que todo el consorcio reciba falsas alertas.",
    pie: "Central de Monitoreo Vig.IA",
  },
  {
    n: "03",
    titulo: "Emisión de alerta",
    texto:
      "El operador emite un audio en vivo por altoparlante. El intruso desiste de su actitud y se retira del lugar: sabe que lo están filmando y que están llamando al 911.",
    pie: "Audio disuasivo en vivo",
  },
  {
    n: "04",
    titulo: "Informe detallado al consorcio",
    texto:
      "El administrador recibe en su correo electrónico un informe detallado de lo acontecido, con la hora, el tipo de evento, la evidencia de video y la minuta del protocolo de actuación.",
    pie: "Reporte automático",
  },
] as const;
