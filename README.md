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

## Escritorio y celular

La demo tiene dos vistas, no una escalada. En pantallas de más de 820 px de
ancho se usa el panel de 1920x1080 escalado; abajo de eso —o con menos de
500 px de alto, que es un celular acostado— se arma un recorrido vertical
pensado para el pulgar. Es donde más se ve: el QR lo escanean los vecinos.

Las dos consumen el mismo hook [`useDemoMachine`](lib/useDemoMachine.ts), así
que los pasos, los tiempos y el video son idénticos y no se pueden
desincronizar. Lo único que cambia es cómo se acomoda en pantalla.

## El material de cámara

Las cámaras 01, 02 y 03 usan video real generado en Flow; la 04 todavía usa una
escena vectorial de respaldo. Los archivos y cómo se reemplazan están
documentados en [`public/cams/LEEME.txt`](public/cams/LEEME.txt).

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
