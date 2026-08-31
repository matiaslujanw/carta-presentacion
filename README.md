# Vig.IA — Demo interactiva del panel de monitoreo con IA

Simulación web del software de la central de monitoreo, para usar en reuniones
comerciales con consorcios (Zoom o presencial). Reemplaza al prototipo de Figma:
se comparte por link o QR, se abre en cualquier navegador y el vendedor la maneja
con clics.

## Correr en local

```bash
npm install
npm run dev
```

Abre en http://localhost:3000

## El recorrido (4 pantallas)

1. **Panel general** — grilla de 4 cámaras, feed "IA Operando — No se detectan
   anomalías". Para avanzar: clic en la **Cam 03** (parpadea sola a los 3 s) o
   en el indicador "Analítica IA" de la barra superior.
2. **Alerta de la IA** — la Cam 03 toma el centro, la analítica traza el
   bounding box sobre el sospechoso y la confianza sube hasta 98 %. Avanza con
   el botón azul **Iniciar Protocolo de Disuasión Humana**.
3. **Protocolo y central humana** — cronómetro real 0 → 3 s, micrófono del
   tótem activo, onda de audio en movimiento y la minuta del operador
   tipeándose. El sospechoso se retira del cuadro. Avanza con el botón verde
   **Cerrar Incidente**.
4. **Reporte al administrador** — pop-up con el mail automático: logo, fecha y
   hora, tipo de evento, estado y las dos capturas adjuntas.
   **Finalizar Demostración** reinicia todo para la próxima reunión.

## Parámetros de URL

| Parámetro | Ejemplo | Para qué |
|---|---|---|
| `consorcio` | `?consorcio=Torres del Bosque` | Personaliza el nombre en toda la demo. Uno por cliente. |
| `modo` | `?modo=auto` | Corre sola, sin clics, y vuelve a empezar. Es el link del QR. |
| `sello` | `?sello=off` | Oculta el sello "Simulación demostrativa". |

Se combinan: `?consorcio=Barrio Los Nogales&modo=auto`

## Cambiar las fotos de las cámaras

Las cámaras traen una escena vectorial de respaldo, pero están cableadas para
usar fotos reales. Copiá los archivos a `public/cams/` con estos nombres:

| Archivo | Cámara |
|---|---|
| `cam1.jpg` | Hall / entrada principal |
| `cam2.jpg` | Cochera / acceso vehicular |
| `cam3.jpg` | Perímetro lateral / reja — **la cámara del evento** |
| `cam4.jpg` | Vereda con el tótem |
| `intruso.png` | Silueta del sospechoso, fondo transparente (opcional) |

No hay que tocar código: si el archivo está, se usa la foto; si no está, se
dibuja la escena de respaldo. Formato 16:9 (ideal 1920x1080), JPG hasta ~500 KB.
**Pueden ser fotos de día**: la demo les aplica corrección nocturna e infrarroja
para que se lean como un feed de las 3 de la mañana.

### Si cambiás `cam3.jpg`

El recuadro rojo puede no caer justo sobre la persona. Se ajusta en
[`lib/config.ts`](lib/config.ts), en `INTRUDER.figure` y `INTRUDER.box`
(valores en % del cuadro: `left`, `top`, `width`, `height`).

### Video en lugar de fotos

Si tenés loops reales en mp4, ponelos en `public/cams/` y agregá
`video: "/cams/cam3.mp4"` a la cámara correspondiente en `lib/config.ts`.

## Textos, tiempos y marca

Todo lo editable está en [`lib/config.ts`](lib/config.ts): nombre del consorcio
por defecto, zonas de las cámaras, confianza de la detección, minuta del
operador línea por línea, tiempo de respuesta, contenido del reporte y duración
de cada paso en modo automático.

Para usar el logo real: copiá el PNG a `public/vigia-logo.png` y poné
`LOGO_SRC = "/vigia-logo.png"` en `lib/config.ts`.

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
