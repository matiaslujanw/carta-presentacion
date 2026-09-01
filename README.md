# Vig.IA — Demo interactiva del panel de monitoreo con IA

Presentación interactiva de venta para consorcios, con un caso real de intrusión
en el perímetro. Reemplaza al prototipo de Figma: se comparte por link o QR, se
abre en cualquier navegador y el vendedor la maneja con clics.

## Correr en local

```bash
npm install
npm run dev
```

Abre en http://localhost:3000

## Qué hay en cada URL

| Ruta | Qué es |
|---|---|
| `/` | **La presentación de venta.** Portada con "Empezar simulación", el caso de intrusión en tres momentos y las tarjetas de cómo actúa la central. Es lo que se manda por link o QR. |
| `/panel` | El panel completo de la central, con las cuatro cámaras y el recorrido de cuatro hojas. Para el cliente técnico que quiera ver el software. |

### La presentación

1. **Portada** — el consorcio por nombre, una línea de qué se va a ver y el botón.
2. **La IA detecta** — la Cam 03 con el recuadro sobre el sospechoso, 98% de confianza.
3. **Responde una persona** — los 3 segundos hasta que habla el operador por el tótem.
4. **Perímetro despejado** — el sospechoso se retira y el cuadro queda vacío.
5. **Cómo actuamos** — cuatro tarjetas, el reporte que recibe el administrador y el cierre con WhatsApp.

Una sola página que se acomoda a cualquier pantalla: no hay versión aparte para celular.

### El panel (`/panel`)

Cuatro hojas: panel general → alerta de la IA → protocolo con la central humana →
reporte automático. En escritorio se usa el panel de 1920x1080 escalado; en
celular, un recorrido vertical. Las dos vistas consumen el mismo hook
[`useDemoMachine`](lib/useDemoMachine.ts), así que no se pueden desincronizar.

## Parámetros de URL

| Parámetro | Ejemplo | Para qué |
|---|---|---|
| `consorcio` | `?consorcio=Torres del Bosque` | Personaliza el nombre en toda la demo. Uno por cliente. |
| `modo` | `?modo=auto` | Corre sola, sin clics, y vuelve a empezar. Es el link del QR. |
| `sello` | `?sello=off` | Oculta el sello "Simulación demostrativa". |

Se combinan: `?consorcio=Barrio Los Nogales&modo=auto`

## Imágenes de control de acceso

La sección "El tótem también es la puerta" usa dos fotos de
`public/accesos/`, retocadas para el mercado argentino (patente del Mercosur y
carteles en castellano). Detalles en
[`docs/imagenes-de-acceso.md`](docs/imagenes-de-acceso.md).

## Sonido

Los sonidos de máquina —la alarma de la analítica, el enganche del recuadro,
el clic del altoparlante— se sintetizan en el navegador con Web Audio
([`lib/sound.ts`](lib/sound.ts)). No son archivos: no hay nada que descargar y
funcionan sin conexión.

La **voz del operador** sí es un archivo, y todavía falta:
`public/audio/operador.mp3`. Tiene que ser una persona real grabada, no una voz
sintética: todo el argumento de venta es que del otro lado hay alguien. Ver
[`docs/voz-del-operador.md`](docs/voz-del-operador.md). Si el archivo no está, la
frase igual se lee en pantalla y el resto del operativo suena normal.

El navegador no deja sonar nada hasta que la persona toca algo, así que el audio
se desbloquea con el botón "Empezar simulación". En modo automático aparece un
botón "Activar sonido".

> **En Zoom**, al compartir pantalla hay que tildar **"Compartir sonido"**. Si no,
> los vecinos ven la demo pero no escuchan nada.

## El material de cámara

Las cámaras 01, 02 y 03 usan video real generado en Flow; la 04 todavía usa una
escena vectorial de respaldo. Los archivos y cómo se reemplazan están
documentados en [`docs/material-de-camara.md`](docs/material-de-camara.md).

Lo importante: **la Cam 03 sale de una sola toma continua**
(`cam3.mp4`). Los tres estados —perímetro vacío, persona merodeando, persona
retirándose— son tramos de ese mismo plano, definidos en `EVENT_TAKE` dentro de
[`lib/config.ts`](lib/config.ts). Por eso el encuadre y la luz coinciden entre
pantallas sin que haya nada que ajustar.

Si falta un archivo, esa cámara cae sola en su escena vectorial y la demo sigue
funcionando.

## Textos, tiempos y marca

Todo lo editable está en [`lib/config.ts`](lib/config.ts): nombre del consorcio
por defecto, zonas de las cámaras, confianza de la detección, minuta del
operador línea por línea, tiempo de respuesta, contenido del reporte y duración
de cada paso en modo automático.

Para usar el logo real: copiá el PNG a `public/vigia-logo.png` y poné
`LOGO_SRC = "/vigia-logo.png"` en `lib/config.ts`.

## Regla de /public

**Todo lo que está en `public/` tiene dirección pública.** No hay carpeta
privada ahí adentro, y un guión bajo adelante no esconde nada: cualquiera que
le corte el final a la URL del QR puede pedir el archivo. Las notas internas
van en [`docs/`](docs/) y el material descartado en `material-crudo/`.

Los mp4 tienen que estar guardados con el índice al principio (*faststart*) o
el salto por tramos de la Cam 03 llega tarde en conexiones lentas. Si agregás
un video nuevo, pasale el mismo tratamiento antes de subirlo.

## Deploy en Vercel

```bash
npx vercel --prod
```

El sitio es estático: una vez cargado en el navegador no depende de la red, así
que aguanta un wifi malo en plena reunión.

## Nota

El sello "Simulación demostrativa" está a propósito: la demo muestra cómo
funciona el sistema, no un incidente real grabado en el edificio del cliente.
Se puede ocultar con `?sello=off`.
