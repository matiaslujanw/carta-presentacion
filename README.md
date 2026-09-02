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
| `/` | **La presentación de venta.** Las nueve escenas del guion, una por pantalla, con un botón para avanzar. Es lo que se manda por link o QR. |
| `/panel` | El panel completo de la central, con las cuatro cámaras y el recorrido de cuatro hojas. Para el cliente técnico que quiera ver el software. |

### La presentación

Sigue el guion aprobado escena por escena: once pantallas para las nueve escenas
del guion más el reporte y el cierre.

**En pantalla no se numeran las escenas.** Los números de la tabla de abajo son
para hablar entre nosotros y ubicarse en el guion; al cliente no se le muestra
ni "Escena 7" ni un contador, porque le hace ver el andamiaje en vez de la
presentación. El avance se indica sólo con la barrita del encabezado.

| # | Escena | Qué se ve |
|---|---|---|
| 01 | Portada | La marca al centro, "Bienvenidos a la nueva era de la seguridad" y el botón **Ver demo**. |
| 02 | La IA detecta | La Cam 03 con el recuadro sobre el sospechoso, 98% de confianza. |
| 03 | Responde una persona | Los 3 segundos hasta que habla el operador por el altoparlante del tótem. |
| 04 | Perímetro despejado | El sospechoso se retira y el cuadro queda vacío. |
| 05 | Paso a paso | Las cuatro tarjetas 01→04 de cómo actúa la central. |
| — | Reporte al administrador | Las capturas del antes y el después, más los datos del caso. |
| 06 | Control de acceso biométrico | Rostro, palma y código numérico. |
| 07 | Tótem IA | El operador de turno en pantalla, las cámaras del consorcio, los botones de pánico y las notificaciones del administrador. |
| 08 | Acceso a cocheras con cámara LPR | El portón lee la patente y se abre solo. |
| 09 | Trazabilidad de registros | El registro del día, sellado, con el plazo de guarda por contrato. |
| — | Cierre | "Tecnología de vanguardia para tu seguridad" y el relevamiento sin cargo. |

Las escenas 1 a 5 más el reporte viven en
[`Presentation.tsx`](components/Presentation.tsx); las 6 a 9, en
[`ProductScenes.tsx`](components/ProductScenes.tsx). Los textos de venta están al
principio de cada archivo, no repartidos por el JSX.

**Cada escena entra en una pantalla, sin scroll.** Es la razón por la que en
celular todo se apila y desde tablet se parte en dos columnas: si la imagen va a
todo el ancho, el mensaje del operador y el botón de avance caen abajo del
pliegue y el vendedor tiene que scrollear en medio de la reunión. Si agregás
contenido a una escena, verificá que `document.documentElement.scrollHeight`
siga igual a `window.innerHeight` en 1440x900.

Una sola página que se acomoda a cualquier pantalla: no hay versión aparte para
celular.

### El panel (`/panel`)

Cuatro hojas: panel general → alerta de la IA → protocolo con la central humana →
reporte automático. En escritorio se usa el panel de 1920x1080 escalado; en
celular, un recorrido vertical. Las dos vistas consumen el mismo hook
[`useDemoMachine`](lib/useDemoMachine.ts), así que no se pueden desincronizar.

## Parámetros de URL

| Parámetro | Ejemplo | Para qué |
|---|---|---|
| `consorcio` | `?consorcio=Torres del Bosque` | Personaliza el nombre en `/panel`. La presentación ya no nombra al consorcio en ninguna pantalla. |
| `modo` | `?modo=auto` | Corre sola, sin clics, y vuelve a empezar. Es el link del QR. |
| `sello` | `?sello=off` | Oculta el sello "Simulación demostrativa". |

Se combinan: `?modo=auto&sello=off`

## Imágenes de control de acceso

Las escenas 6 y 8 usan dos fotos de `public/accesos/`, retocadas para el
mercado argentino (patente del Mercosur y carteles en castellano). La escena 7
usa `public/cams/cam4.jpg`, la foto real del tótem en un lobby. Detalles en
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
se desbloquea con el botón "Ver demo". En modo automático aparece un
botón "Activar sonido".

### En iPhone, el interruptor de silencio manda

**Safari en iOS silencia el Web Audio cuando el teléfono está en silencio**, y
todos los sonidos de la demo son Web Audio. Un `<audio>` común iniciado por un
toque sí sonaría, pero acá no hay archivos: se sintetizan.

O sea que el interruptor lateral del iPhone apaga exactamente los sonidos de la
demo y nada más. **No hay forma de saltearlo por código**, así que la portada
avisa cuando detecta un iOS. Si alguien reporta "en la compu suena y en el
celular no", esto es lo primero que hay que preguntar.

Por la misma razón `unlockAudio()` dispara un buffer mudo de un frame dentro
del mismo toque ([`lib/sound.ts`](lib/sound.ts)): a Safari no le alcanza con
`resume()` para dar el audio por desbloqueado.

Y `resume()` es asincrónico, así que los sonidos se agendan recién cuando el
contexto está `running` (la función `schedule`). Si se agendan antes, quedan
apuntando a un reloj que todavía no avanza y, cuando arranca, ya pasó su
horario: no suenan nunca. Esa carrera se perdía casi siempre en un celular.

> **En Zoom**, al compartir pantalla hay que tildar **"Compartir sonido"**. Si no,
> los vecinos ven la demo pero no escuchan nada.

## El material de cámara

Las cámaras 01, 02 y 03 usan video real generado en Flow; la 04 usa la foto real
del tótem (`cam4.jpg`), que la escena 7 de la presentación reutiliza sin
corrección nocturna. Los archivos y cómo se reemplazan están documentados en
[`docs/material-de-camara.md`](docs/material-de-camara.md).

Lo importante: **la Cam 03 sale de una sola toma continua**
(`cam3.mp4`). Los tres estados —perímetro vacío, persona merodeando, persona
retirándose— son tramos de ese mismo plano, definidos en `EVENT_TAKE` dentro de
[`lib/config.ts`](lib/config.ts). Por eso el encuadre y la luz coinciden entre
pantallas sin que haya nada que ajustar.

Si falta un archivo, esa cámara cae sola en su escena vectorial y la demo sigue
funcionando.

## Textos, tiempos y marca

Los datos del sistema están en [`lib/config.ts`](lib/config.ts): nombre del
consorcio por defecto, zonas de las cámaras, confianza de la detección, minuta
del operador línea por línea, tiempo de respuesta y contenido del reporte.

Los **textos de venta** de la presentación están arriba de cada componente, no en
config: `BEATS`, `PASOS`, `CTA` y las duraciones `AUTO_MS` del modo automático en
[`Presentation.tsx`](components/Presentation.tsx), y `DATA` en
[`ProductScenes.tsx`](components/ProductScenes.tsx). Se editan ahí y son la
copia fiel del guion aprobado: si cambia el guion, cambia ese bloque.

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
