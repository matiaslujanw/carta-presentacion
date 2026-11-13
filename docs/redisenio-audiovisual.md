# Rediseño audiovisual de la presentación Vig.IA

## Estado

Versión funcional con locución para evaluación en la ruta `/experiencia`.

- La presentación comercial original se conserva en `/`.
- El panel técnico se conserva en `/panel`.
- La experiencia audiovisual no reemplaza ninguna ruta existente.
- La locución se generó en siete segmentos sincronizados con las escenas.

## Auditoría del proyecto original

### Stack

- Next.js 16 con App Router.
- React 19.
- Tailwind CSS 4 para la experiencia original.
- Sin librerías de animación externas.
- Despliegue estático compatible con Vercel.

### Material reutilizado

| Recurso | Uso audiovisual |
|---|---|
| `public/cams/cam1.mp4` | Apertura cinematográfica y feed del hall. |
| `public/cams/cam2.mp4` | Feed de acceso vehicular. |
| `public/cams/cam3.mp4` | Caso de intrusión, detección y respuesta. |
| `public/cams/cam4.jpg` | Tótem IA y presencia del operador. |
| `public/accesos/ingreso-peatonal.jpg` | Acceso biométrico. |
| `public/accesos/ingreso-vehicular.jpg` | Lectura de patente LPR. |
| `Cam3Still` | Evidencia del antes y después. |
| `Logo` | Identidad visual consistente. |
| `lib/config.ts` | Marca, tiempos, reporte y datos reales del caso. |

### Decisiones

- No se incorporó Framer Motion: las transiciones se resuelven con CSS para no aumentar el peso ni sumar una dependencia innecesaria.
- El controlador de reproducción vive separado de las escenas.
- La duración total es de aproximadamente 100 segundos.
- La línea de tiempo funciona aun sin audio, usando el reloj del navegador.
- Cuando exista una locución, el elemento `<audio>` pasa a ser el reloj de la escena y mantiene subtítulos y animaciones sincronizados.
- Los controles incluyen reproducir, pausar, avanzar, retroceder, buscar, silenciar, volumen y subtítulos.

## Storyboard y guion

| # | Duración | Escena | Mensaje principal | Visual |
|---|---:|---|---|---|
| 01 | 12 s | Apertura | Vig.IA integra IA y respuesta humana. | Video del hall, logo, señales 24/7. |
| 02 | 13 s | El desafío | Grabar después del hecho ya no alcanza. | Detectar → verificar → actuar. |
| 03 | 20 s | Accesos | Biometría, LPR y Tótem IA como un mismo sistema. | Galería animada con los tres productos. |
| 04 | 17 s | Monitoreo IA | La analítica observa y genera alertas definidas. | Mosaico de cámaras y tracking del intruso. |
| 05 | 18 s | Intervención | Un operador verifica y actúa en tres segundos. | Operador, audio disuasivo y respuesta. |
| 06 | 14 s | Trazabilidad | Todo queda registrado y se informa. | Minuta, evidencias y reporte automático. |
| 07 | 12 s | Cierre | Tecnología que detecta; personas que actúan. | Marca, CTA y datos de contacto. |

El texto definitivo de la relatora y los subtítulos están centralizados en
`lib/audiovisualContent.ts`.

## Locución integrada

Archivos esperados:

```text
public/audio/audiovisual/01-apertura.mp3
public/audio/audiovisual/02-problema.mp3
public/audio/audiovisual/03-accesos.mp3
public/audio/audiovisual/04-monitoreo.mp3
public/audio/audiovisual/05-intervencion.mp3
public/audio/audiovisual/06-trazabilidad.mp3
public/audio/audiovisual/07-cierre.mp3
```

La generación se puede repetir con:

```bash
npm run audio:generate
```

El script lee `OPENROUTER_API_KEY` exclusivamente desde `.env.local`. La voz
usa ElevenLabs v4 a través de OpenRouter, en español, con una interpretación
cálida, segura y contenida. Las duraciones y los subtítulos están ajustados a
los archivos generados.

La voz buscada es femenina, profesional, natural, en español argentino, con
tono tecnológico y confiable. No debe sonar como asistente virtual ni como
publicidad radial exagerada.

## Pendientes antes de publicar

- Revisar y aprobar la interpretación final de la locución.
- Elegir o producir música ambiental con licencia adecuada.
- Integrar y mezclar voz, música y efectos con niveles consistentes.
- Validar la experiencia con audio en Safari iOS y Chrome Android.
- Realizar una revisión comercial final de textos y claims.
- Crear un preview de Vercel separado; no reemplazar producción hasta aprobarlo.
