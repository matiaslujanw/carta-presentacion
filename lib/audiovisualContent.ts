export type AudiovisualSceneId =
  | "apertura"
  | "problema"
  | "accesos"
  | "monitoreo"
  | "intervencion"
  | "trazabilidad"
  | "cierre";

export type CaptionCue = {
  start: number;
  end: number;
  text: string;
};

export type AudiovisualScene = {
  id: AudiovisualSceneId;
  navLabel: string;
  eyebrow: string;
  title: string;
  duration: number;
  narration: string;
  captions: CaptionCue[];
  /**
   * La locución definitiva se conecta acá cuando el archivo esté aprobado.
   * Mientras sea null, el controlador usa `duration` como reloj y reproduce
   * la experiencia con subtítulos, sin fingir que existe una voz.
   */
  audioSrc: string | null;
  expectedAudioFile: string;
};

export const AUDIOVISUAL_SCENES: AudiovisualScene[] = [
  {
    id: "apertura",
    navLabel: "Vig.IA",
    eyebrow: "Seguridad con inteligencia",
    title: "La seguridad que se anticipa",
    duration: 9.17,
    narration:
      "En Vig.IA, la seguridad no se limita a observar. Integramos inteligencia artificial y respuesta humana para anticiparnos a cada riesgo.",
    captions: [
      { start: 0, end: 4.43, text: "En Vig.IA, la seguridad no se limita a observar." },
      {
        start: 4.43,
        end: 9.17,
        text: "Integramos inteligencia artificial y respuesta humana para anticiparnos a cada riesgo.",
      },
    ],
    audioSrc: "/audio/audiovisual/01-apertura.mp3",
    expectedAudioFile: "/audio/audiovisual/01-apertura.mp3",
  },
  {
    id: "problema",
    navLabel: "El desafío",
    eyebrow: "Más que cámaras",
    title: "Grabar lo que pasó ya no alcanza",
    duration: 11.47,
    narration:
      "La seguridad tradicional registra el problema cuando ya ocurrió. Una solución moderna debe detectar, verificar y actuar a tiempo, sin llenar al consorcio de falsas alarmas.",
    captions: [
      {
        start: 0,
        end: 5.56,
        text: "La seguridad tradicional registra el problema cuando ya ocurrió.",
      },
      {
        start: 5.56,
        end: 11.47,
        text: "Una solución moderna debe detectar, verificar y actuar a tiempo, sin falsas alarmas.",
      },
    ],
    audioSrc: "/audio/audiovisual/02-problema.mp3",
    expectedAudioFile: "/audio/audiovisual/02-problema.mp3",
  },
  {
    id: "accesos",
    navLabel: "Accesos",
    eyebrow: "Todos los días",
    title: "Ingresos simples, seguros y registrados",
    duration: 19.88,
    narration:
      "El acceso comienza antes de entrar. Reconocimiento facial, identificación palmar o código numérico para las personas autorizadas. Cámara LPR para las cocheras. Y dentro del edificio, el Tótem IA conecta a los vecinos con un operador real, las cámaras y los protocolos de emergencia.",
    captions: [
      {
        start: 0,
        end: 6.96,
        text: "Reconocimiento facial, identificación palmar o código numérico para las personas autorizadas.",
      },
      { start: 6.96, end: 11.43, text: "Cámara LPR para automatizar el acceso a las cocheras." },
      {
        start: 11.43,
        end: 19.88,
        text: "El Tótem IA conecta a los vecinos con un operador real, las cámaras y los protocolos de emergencia.",
      },
    ],
    audioSrc: "/audio/audiovisual/03-accesos.mp3",
    expectedAudioFile: "/audio/audiovisual/03-accesos.mp3",
  },
  {
    id: "monitoreo",
    navLabel: "Monitoreo IA",
    eyebrow: "Vigilancia inteligente 24/7",
    title: "La inteligencia artificial detecta lo que importa",
    duration: 15.8,
    narration:
      "Las cámaras son analizadas de forma permanente. La inteligencia artificial identifica situaciones de riesgo previamente definidas y genera una alerta con imagen en vivo. En este caso, una persona merodea una zona prohibida a las tres de la mañana.",
    captions: [
      { start: 0, end: 5.11, text: "Las cámaras son analizadas de forma permanente." },
      {
        start: 5.11,
        end: 10.41,
        text: "La IA identifica situaciones de riesgo y genera una alerta con imagen en vivo.",
      },
      {
        start: 10.41,
        end: 15.8,
        text: "Una persona merodea una zona prohibida a las tres de la mañana.",
      },
    ],
    audioSrc: "/audio/audiovisual/04-monitoreo.mp3",
    expectedAudioFile: "/audio/audiovisual/04-monitoreo.mp3",
  },
  {
    id: "intervencion",
    navLabel: "Respuesta",
    eyebrow: "Decisión humana",
    title: "La alerta llega. Una persona responde.",
    duration: 17.01,
    narration:
      "En solo tres segundos, un operador verifica la imagen y aplica el protocolo acordado. Abre el canal de audio del tótem y advierte al intruso. La presencia humana evita una falsa alarma y transforma la detección en una respuesta concreta. El sospechoso se retira.",
    captions: [
      {
        start: 0,
        end: 5.67,
        text: "En solo tres segundos, un operador verifica la imagen y aplica el protocolo acordado.",
      },
      { start: 5.67, end: 10.86, text: "Abre el canal de audio del tótem y advierte al intruso." },
      {
        start: 10.86,
        end: 17.01,
        text: "La detección se convierte en una respuesta concreta. El sospechoso se retira.",
      },
    ],
    audioSrc: "/audio/audiovisual/05-intervencion.mp3",
    expectedAudioFile: "/audio/audiovisual/05-intervencion.mp3",
  },
  {
    id: "trazabilidad",
    navLabel: "Evidencia",
    eyebrow: "Todo queda registrado",
    title: "Evidencia clara para saber qué ocurrió",
    duration: 13.17,
    narration:
      "Cada evento conserva la hora, la clasificación, la evidencia y la actuación del operador. El administrador recibe el informe completo, mientras los registros quedan resguardados por el período definido en el contrato.",
    captions: [
      {
        start: 0,
        end: 6.4,
        text: "Cada evento conserva la hora, la clasificación, la evidencia y la actuación del operador.",
      },
      {
        start: 6.4,
        end: 13.17,
        text: "El administrador recibe el informe y los registros quedan resguardados según contrato.",
      },
    ],
    audioSrc: "/audio/audiovisual/06-trazabilidad.mp3",
    expectedAudioFile: "/audio/audiovisual/06-trazabilidad.mp3",
  },
  {
    id: "cierre",
    navLabel: "Vig.IA",
    eyebrow: "Una solución integral",
    title: "Tecnología que detecta. Personas que actúan.",
    duration: 21.08,
    narration:
      "Vig.IA combina accesos inteligentes, monitoreo con inteligencia artificial y supervisión humana. Importante: Vig.IA entrega el equipamiento sin costo, en comodato. También se hace cargo del mantenimiento y la actualización. Hacemos el relevamiento de tu edificio sin cargo. Conocé una forma más inteligente de cuidar lo que importa.",
    captions: [
      {
        start: 0,
        end: 4.8,
        text: "Accesos inteligentes, monitoreo con IA y supervisión humana.",
      },
      {
        start: 4.8,
        end: 10,
        text: "Vig.IA entrega el equipamiento sin costo, en comodato.",
      },
      {
        start: 10,
        end: 14.6,
        text: "También se hace cargo del mantenimiento y la actualización.",
      },
      {
        start: 14.6,
        end: 21.08,
        text: "Hacemos el relevamiento de tu edificio sin cargo.",
      },
    ],
    audioSrc: "/audio/audiovisual/07-cierre.mp3",
    expectedAudioFile: "/audio/audiovisual/07-cierre.mp3",
  },
];

export const AUDIOVISUAL_TOTAL_DURATION = AUDIOVISUAL_SCENES.reduce(
  (total, scene) => total + scene.duration,
  0,
);

export function formatPlaybackTime(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safe / 60);
  return `${minutes}:${String(safe % 60).padStart(2, "0")}`;
}
