MATERIAL DE CÁMARA — Vig.IA demo
================================

EN USO
  cam1.mp4   Hall / entrada principal          → Cam 01
  cam2.mp4   Cochera / acceso vehicular        → Cam 02
  cam3.mp4   Perímetro lateral                 → Cam 03 (la cámara del evento)

  cam3.mp4 es UNA SOLA TOMA CONTINUA de la que salen los tres estados. Los
  segundos de cada tramo están en lib/config.ts, en EVENT_TAKE:

      1,90 → 3,50 s   la persona merodeando la reja   (Hojas 2 y 3)
      3,50 → 6,60 s   se retira, el cuadro se vacía   (final de la Hoja 3)
      6,55 → 7,95 s   el perímetro vacío, en loop     (Hoja 1)

  Como es el mismo plano, el encuadre y la luz coinciden solos: no hay salto
  posible entre pantallas.

  cam4.png   Foto real del tótem               → Cam 04
  Es una foto, no video: va con corrección nocturna fuerte y una deriva lenta
  para que no parezca congelada al lado de los otros tres feeds. El encuadre
  está corrido hacia arriba (focus en lib/config.ts) para que entren el cabezal
  con la cámara y la pantalla con el operador.

RESERVA
  _reserva-totem-vertical.mp4
  Video del tótem en un lobby. No entró: salió vertical, de día y con la
  cámara acercándose. Sirve como pieza de marketing, no como feed de cámara.

  _reserva-porton.mp4
  Silueta encapuchada sosteniendo un portón. Es la mejor toma de todas, pero
  es otro lugar y no hay versión vacía del mismo encuadre. Si algún día
  generás ese portón VACÍO con el mismo plano, conviene mudar la Cam 03 a este
  material: el contraluz es muy superior.

SI CAMBIÁS cam3.mp4
  Hay que retocar dos cosas en lib/config.ts y nada más:
   - EVENT_TAKE, los segundos de cada tramo
   - INTRUDER.boxBaked, dónde cae el recuadro rojo (en % del VIDEO, no del
     panel: la demo ya corrige el recorte de cada pantalla sola)

FORMATO
  16:9, 1280x720 alcanza y sobra. Sin audio: la demo va en mute.
  Sin reloj ni texto quemado en la imagen: la demo dibuja el suyo encima y se
  superponen.
