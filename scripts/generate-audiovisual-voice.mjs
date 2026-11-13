import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  throw new Error("Falta OPENROUTER_API_KEY. Ejecutá el script con --env-file=.env.local.");
}

const scenes = [
  {
    id: "01",
    file: "01-apertura.mp3",
    text: "En Vigía, la seguridad no se limita a observar. Integramos inteligencia artificial y respuesta humana para anticiparnos a cada riesgo.",
  },
  {
    id: "02",
    file: "02-problema.mp3",
    text: "La seguridad tradicional registra el problema cuando ya ocurrió. Una solución moderna debe detectar, verificar y actuar a tiempo, sin llenar al consorcio de falsas alarmas.",
  },
  {
    id: "03",
    file: "03-accesos.mp3",
    text: "El acceso comienza antes de entrar. Reconocimiento facial, identificación palmar o código numérico para las personas autorizadas. Cámara ele pe erre para las cocheras. Y dentro del edificio, el Tótem de inteligencia artificial conecta a los vecinos con un operador real, las cámaras y los protocolos de emergencia.",
  },
  {
    id: "04",
    file: "04-monitoreo.mp3",
    text: "Las cámaras son analizadas de forma permanente. La inteligencia artificial identifica situaciones de riesgo previamente definidas y genera una alerta con imagen en vivo. En este caso, una persona merodea una zona prohibida a las tres de la mañana.",
  },
  {
    id: "05",
    file: "05-intervencion.mp3",
    text: "En solo tres segundos, un operador verifica la imagen y aplica el protocolo acordado. Abre el canal de audio del tótem y advierte al intruso. La presencia humana evita una falsa alarma y transforma la detección en una respuesta concreta. El sospechoso se retira.",
  },
  {
    id: "06",
    file: "06-trazabilidad.mp3",
    text: "Cada evento conserva la hora, la clasificación, la evidencia y la actuación del operador. El administrador recibe el informe completo, mientras los registros quedan resguardados por el período definido en el contrato.",
  },
  {
    id: "07",
    file: "07-cierre.mp3",
    text: "Vigía combina accesos inteligentes, monitoreo con inteligencia artificial y supervisión humana. Hacemos el relevamiento de tu edificio sin cargo. Conocé una forma más inteligente de cuidar lo que importa.",
  },
];

const requestedScene = process.argv.find((argument) => argument.startsWith("--scene="))?.split("=")[1];
const selectedScenes = requestedScene
  ? scenes.filter((scene) => scene.id === requestedScene.padStart(2, "0"))
  : scenes;

if (selectedScenes.length === 0) {
  throw new Error(`No existe la escena ${requestedScene}. Usá un número del 1 al 7.`);
}

const outputDirectory = path.join(process.cwd(), "public", "audio", "audiovisual");
await mkdir(outputDirectory, { recursive: true });

for (const scene of selectedScenes) {
  const response = await fetch("https://openrouter.ai/api/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://vigiaseguridad.com.ar",
      "X-Title": "Vig.IA · Presentación audiovisual",
    },
    body: JSON.stringify({
      model: "elevenlabs/eleven-v4",
      input: `[cálida, natural y segura; ritmo sereno; acento argentino suave; sin tono de locutora publicitaria]\n${scene.text}`,
      voice: "sarah",
      response_format: "mp3",
      provider: {
        options: {
          elevenlabs: {
            language_code: "es",
            voice_settings: {
              stability: 0.42,
              similarity_boost: 0.78,
              style: 0.38,
              use_speaker_boost: true,
            },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter respondió ${response.status} para ${scene.file}: ${await response.text()}`);
  }

  const contentType = response.headers.get("content-type")?.split(";")[0];
  if (contentType !== "audio/mpeg") {
    throw new Error(`Se esperaba audio/mpeg para ${scene.file}, pero llegó ${contentType ?? "sin tipo"}.`);
  }

  const outputPath = path.join(outputDirectory, scene.file);
  await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
  console.log(`Generado ${scene.file}`);
}
